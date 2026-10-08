import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract, parseArgs, redact } from '../skills/plumb-dream/scripts/extract.mjs';

const SCRIPT_DIR = fileURLToPath(new URL('../skills/plumb-dream/scripts/', import.meta.url));
const SCRIPT = join(SCRIPT_DIR, 'extract.mjs');

const FIXTURE = [
  { type: 'user', message: { content: 'corrige o checkout' }, timestamp: '2026-10-01T10:00:00Z' },
  { type: 'user', message: { content: '<system-reminder>ruído</system-reminder>' } },
  { type: 'attachment', attachment: { type: 'hook_success', content: 'ok' } },
  { type: 'assistant', message: { content: [{ type: 'thinking', thinking: 'segredo interno' }, { type: 'text', text: 'Vou rodar os testes.' }] } },
  { type: 'assistant', message: { content: [{ type: 'tool_use', id: 't1', name: 'Bash', input: { command: 'npm test' } }] } },
  { type: 'user', toolUseResult: {}, message: { content: [{ type: 'tool_result', tool_use_id: 't1', is_error: true, content: 'Error: DATABASE_URL ausente' }] } },
  { type: 'user', message: { content: 'na verdade, usa sempre centavos inteiros' }, timestamp: '2026-10-02T10:00:00Z' },
  { type: 'assistant', message: { content: [{ type: 'tool_use', id: 't2', name: 'mcp__knowledge-os__item_save', input: { items: [{ key: 'rule/money' }, { key: 'howto/db' }] } }] } },
  { type: 'attachment', attachment: { type: 'hook_blocking_error', stderr: 'Stop hook: grave a diretriz' } },
  'isto não é json',
];

async function* lines(items) {
  for (const i of items) yield typeof i === 'string' ? i : JSON.stringify(i);
}
const asLines = (items) => items.map((i) => (typeof i === 'string' ? i : JSON.stringify(i))).join('\n') + '\n';

test('extrai falas, respostas, chamadas, erros e avisos, com o número da linha', async () => {
  const out = await extract(lines(FIXTURE));
  const text = out.join('\n');
  assert.match(out[0], /2 falas do usuário · 1 respostas · 2 chamadas \(1 gravações no cérebro\) · 1 erros · 1 avisos de hook/);
  assert.match(text, /#1 \[user\] corrige o checkout/);
  assert.match(text, /#4 \[assistant\] Vou rodar os testes\./);
  assert.match(text, /#5 \[tool\] Bash: npm test/);
  assert.match(text, /#6 \[tool-error\] Bash: Error: DATABASE_URL ausente/);
  assert.match(text, /#7 \[user\] na verdade, usa sempre centavos inteiros/);
  assert.match(text, /#8 \[tool\] mcp__knowledge-os__item_save: rule\/money, howto\/db/);
  assert.match(text, /#9 \[hook\] Stop hook: grave a diretriz/);
});

test('ignora o raciocínio interno, o ruído do sistema e as linhas inválidas', async () => {
  const text = (await extract(lines(FIXTURE))).join('\n');
  assert.doesNotMatch(text, /segredo interno/);
  assert.doesNotMatch(text, /ruído/);
  assert.doesNotMatch(text, /isto não é json/);
});

test('--since descarta o que veio antes da data e corta textos longos', async () => {
  const out = await extract(lines(FIXTURE), { since: '2026-10-02' });
  assert.ok(!out.join('\n').includes('corrige o checkout'));
  assert.match(out.join('\n'), /na verdade/);
  const longo = await extract(lines([{ type: 'user', message: { content: 'x'.repeat(5000) } }]), { userMax: 100 });
  assert.match(longo[1], /… \[\+4900\]/);
  await assert.rejects(() => extract(lines(FIXTURE), { since: 'ontem' }), /--since inválido/);
});

test('--from e --to recortam por linha; o teto de saída avisa onde cortou e como continuar', async () => {
  const faixa = (await extract(lines(FIXTURE), { from: 5, to: 7 })).join('\n');
  assert.match(faixa, /#5 \[tool\]/);
  assert.match(faixa, /#7 \[user\]/);
  assert.doesNotMatch(faixa, /#1 \[user\]|#8 \[tool\]/);
  assert.match(faixa.split('\n')[0], /linhas 5–7/);

  const muitas = Array.from({ length: 200 }, (_, i) => ({ type: 'user', message: { content: `fala número ${i} ` + 'x'.repeat(100) } }));
  const cortada = await extract(lines(muitas), { maxChars: 2000 });
  const ultimo = cortada.at(-1);
  assert.match(ultimo, /^# saída cortada em #\d+: continue com --from \d+$/);
  const ate = Number(/#(\d+):/.exec(ultimo)[1]);
  const de = Number(/--from (\d+)/.exec(ultimo)[1]);
  assert.equal(de, ate + 1);
  assert.ok(cortada.join('\n').length < 2600);
  const resto = await extract(lines(muitas), { from: de, maxChars: 2000 });
  assert.match(resto[1], new RegExp(`^#${de} \\[user\\]`));
});

test('item_save com items inválidos não derruba a extração', async () => {
  const out = await extract(
    lines([
      { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'a', name: 'mcp__knowledge-os__item_save', input: { items: 'nada' } }] } },
      { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'b', name: 'mcp__knowledge-os__item_save', input: { items: [null, { key: 'rule/x' }] } }] } },
      { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'c', name: 'Bash', input: null }] } },
    ]),
  );
  assert.match(out.join('\n'), /item_save: \?, rule\/x/);
  assert.match(out[0], /3 chamadas/);
});

test('redige segredos comuns antes de qualquer saída', async () => {
  const casos = [
    ['conecta em postgres://app:s3nh4@db.interno:5432/x', /postgres:\/\/\[redigido\]@db\.interno/],
    ['curl -H "Authorization: Bearer abc123def456ghi789"', /Bearer \[redigido\]/],
    ['NPM_TOKEN=npm_abcdefghij1234567890 npm publish', /NPM_TOKEN=\[redigido\]/],
    ['export STRIPE_SECRET_KEY=sk_live_aaaaaaaaaaaaaaaa', /STRIPE_SECRET_KEY=\[redigido\]/],
    ['minha chave é sk-abcdefghijklmnopqrstuvwxyz', /\[redigido\]/],
    ['ghp_abcdefghijklmnopqrstuvwxyz0123456789', /\[redigido\]/],
    ['AKIAABCDEFGHIJKLMNOP', /\[redigido\]/],
    ['senha: hunter2', /senha=\[redigido\]/],
    ['eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def', /\[redigido\]/],
    ['-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----', /\[redigido\]/],
  ];
  for (const [entrada, esperado] of casos) {
    const saida = redact(entrada);
    assert.match(saida, esperado, entrada);
    assert.doesNotMatch(saida, /s3nh4|abc123def456ghi789|npm_abcdefghij|sk_live_a|hunter2|abcdefghijklmnopqrstuvwxyz|MIIE/, entrada);
  }
  const out = (await extract(lines([{ type: 'user', message: { content: 'use NPM_TOKEN=npm_abcdefghij1234567890 para publicar' } }]))).join('\n');
  assert.doesNotMatch(out, /npm_abcdefghij/);
  assert.equal(redact('texto normal, sem segredo nenhum'), 'texto normal, sem segredo nenhum');
});

test('parseArgs valida os números e as opções', () => {
  assert.deepEqual(parseArgs(['a.jsonl', '--from', '5', '--max-chars', '100']), { file: 'a.jsonl', opts: { from: 5, maxChars: 100 } });
  assert.throws(() => parseArgs(['a.jsonl', '--user-max', 'abc']), /inteiro positivo/);
  assert.throws(() => parseArgs(['a.jsonl', '--from', '0']), /inteiro positivo/);
  assert.throws(() => parseArgs(['a.jsonl', '--nada']), /opção desconhecida/);
});

test('o script lê um arquivo, recorta por faixa e falha com mensagem quando algo está errado', () => {
  const dir = mkdtempSync(join(tmpdir(), 'plumb-extract-'));
  const file = join(dir, 's.jsonl');
  writeFileSync(file, asLines(FIXTURE));
  const ok = spawnSync(process.execPath, [SCRIPT, file], { encoding: 'utf8' });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /\[user\] corrige o checkout/);
  const faixa = spawnSync(process.execPath, [SCRIPT, file, '--from', '7', '--to', '7'], { encoding: 'utf8' });
  assert.match(faixa.stdout, /#7 \[user\]/);
  assert.doesNotMatch(faixa.stdout, /#1 \[user\]/);
  const sem = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(sem.status, 2);
  assert.match(sem.stderr, /uso:/);
  const ruim = spawnSync(process.execPath, [SCRIPT, file, '--user-max', 'abc'], { encoding: 'utf8' });
  assert.equal(ruim.status, 2);
  assert.match(ruim.stderr, /inteiro positivo/);
  const inexistente = spawnSync(process.execPath, [SCRIPT, join(dir, 'nao-existe.jsonl')], { encoding: 'utf8' });
  assert.equal(inexistente.status, 1);
});

test('o script roda também quando chamado por um link (dotfiles, junction): não fica mudo', () => {
  const base = mkdtempSync(join(tmpdir(), 'plumb-link-'));
  const real = join(base, 'real');
  mkdirSync(real);
  cpSync(SCRIPT_DIR, real, { recursive: true });
  const link = join(base, 'link');
  try {
    symlinkSync(real, link, 'junction');
  } catch {
    return; // sem permissão para criar link neste ambiente
  }
  const file = join(base, 's.jsonl');
  writeFileSync(file, asLines(FIXTURE));
  const r = spawnSync(process.execPath, [join(link, 'extract.mjs'), file], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\[user\] corrige o checkout/);
});
