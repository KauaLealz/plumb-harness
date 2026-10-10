import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTER, handle, isDirective, isSave, previousSessionNote, stopCheck, userText } from '../skills/plumb/hooks/entry.mjs';

const HOOK_DIR = fileURLToPath(new URL('../skills/plumb/hooks/', import.meta.url));
const SCRIPT = join(HOOK_DIR, 'entry.mjs');

const user = (text) => ({ type: 'user', message: { role: 'user', content: text } });
const toolResult = () => ({ type: 'user', toolUseResult: {}, message: { role: 'user', content: [{ type: 'tool_result', content: 'ok' }] } });
const tool = (name, input = {}) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', name, input }] } });
const assistantSave = () => tool('mcp__knowledge-os__item_save');
const assistantText = () => ({ type: 'assistant', message: { content: [{ type: 'text', text: 'feito' }] } });

function transcript(entries, dir = mkdtempSync(join(tmpdir(), 'plumb-entry-')), name = 'sessao.jsonl', ageMs = 0) {
  const path = join(dir, name);
  writeFileSync(path, entries.map((e) => JSON.stringify(e)).join('\n') + '\n');
  if (ageMs) {
    const when = new Date(Date.now() - ageMs);
    utimesSync(path, when, when);
  }
  return path;
}

const HOUR = 3_600_000;

test('o roteador cabe em 20 linhas e manda carregar a skill, classificar e consultar o cérebro', () => {
  assert.ok(ROUTER.length <= 20);
  const text = ROUTER.join('\n');
  assert.match(text, /skill `plumb`/);
  assert.match(text, /Classifique/);
  assert.match(text, /segundo cérebro/);
  assert.match(text, /grill/);
  assert.match(text, /\/plumb-grill/);
  assert.match(text, /worktree/);
  assert.match(text, /ferramenta de perguntas/);
  for (const busca of ['plumb-find-docs', 'plumb-find-mcps', 'plumb-find-skills']) assert.ok(text.includes(busca), busca);
  assert.doesNotMatch(text, /Decidi|decidir, não perguntar/i);
});

test('a instrução global fala de grill, worktree, ferramenta de perguntas e das três buscas', () => {
  const text = readFileSync(new URL('../global-instruction.md', import.meta.url), 'utf8');
  for (const re of [/grill/, /worktree/, /ferramenta de perguntas/, /plumb-find-docs/, /plumb-find-mcps/, /plumb-find-skills/]) assert.match(text, re);
  assert.doesNotMatch(text, /Decidi|decidir, não perguntar/i);
});

test('claude-prompt injeta o roteador com o caminho do transcript e nunca bloqueia', () => {
  const out = handle('--claude-prompt', { prompt: 'oi', transcript_path: '/t/s.jsonl' });
  assert.equal(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  assert.match(out.hookSpecificOutput.additionalContext, /\[Plumb\]/);
  assert.match(out.hookSpecificOutput.additionalContext, /\/t\/s\.jsonl/);
  assert.equal(out.decision, undefined);
});

test('cursor-session devolve o roteador em additional_context, sem transcript', () => {
  const out = handle('--cursor-session', {});
  assert.match(out.additional_context, /\[Plumb\]/);
  assert.doesNotMatch(out.additional_context, /Transcript desta sessão/);
});

test('userText ignora resultado de ferramenta, sistema e comando', () => {
  assert.equal(userText(user('oi')), 'oi');
  assert.equal(userText(toolResult()), null);
  assert.equal(userText(user('<system-reminder>x</system-reminder>')), null);
  assert.equal(userText(user('<command-name>/model</command-name>')), null);
});

test('isDirective: imperativo na voz do usuário sim; pergunta, relato, preferência solta e texto colado não', () => {
  for (const ok of [
    'a partir de agora, mensagens de erro sempre em português',
    'de agora em diante use centavos inteiros',
    'sempre use Money em src/payments',
    'nunca commite direto na main',
    'não use mais moment.js',
    'lembre-se que o deploy é pelo make release',
  ]) assert.equal(isDirective(ok), true, ok);
  for (const no of [
    'roda os testes e me diz se sempre falha',
    'prefiro que o QR seja real',
    'toda vez que eu salvo o form limpa',
    'por que você sempre usa tabs?',
    'a partir de agora, o que muda no deploy?',
    'a partir de agora ' + 'x'.repeat(900),
    'segue a issue:\n> a partir de agora, sempre use X',
    'veja:\n```\nsempre use X\n```',
    'corrige o typo em server.js',
  ]) assert.equal(isDirective(no), false, no);
});

test('stop bloqueia uma diretriz sem gravação e deixa passar o resto', () => {
  const directive = user('a partir de agora, mensagens de erro sempre em português');
  const t = transcript([directive, assistantText()]);
  const out = stopCheck({ transcript_path: t });
  assert.equal(out.decision, 'block');
  assert.match(out.reason, /item_save/);
  assert.match(out.reason, /terceiros/);

  assert.equal(stopCheck({ transcript_path: t, stop_hook_active: true }), null, 'nunca em laço');
  assert.equal(stopCheck({ transcript_path: transcript([directive, assistantSave(), assistantText()]) }), null, 'já gravou');
  assert.equal(stopCheck({ transcript_path: transcript([user('corrige o typo em server.js'), assistantText()]) }), null);
  assert.equal(stopCheck({ transcript_path: transcript([user('prefiro que o QR seja real'), assistantText()]) }), null);
  assert.equal(stopCheck({ transcript_path: '/nao/existe.jsonl' }), null);
});

test('stop só olha a última fala do usuário', () => {
  const t = transcript([user('a partir de agora, sempre use português'), assistantSave(), user('roda os testes'), assistantText()]);
  assert.equal(stopCheck({ transcript_path: t }), null);
});

test('isSave reconhece item_save e a fila offline por Bash, PowerShell, Write e Edit', () => {
  assert.equal(isSave(assistantSave()), true);
  assert.equal(isSave(tool('Bash', { command: 'cat >> ~/.knowledge-os/pending.jsonl <<EOF' })), true);
  assert.equal(isSave(tool('PowerShell', { command: 'Add-Content $HOME\\.knowledge-os\\pending.jsonl $linha' })), true);
  assert.equal(isSave(tool('Write', { file_path: 'C:/Users/x/.knowledge-os/pending.jsonl' })), true);
  assert.equal(isSave(tool('Edit', { file_path: '/home/x/.knowledge-os/pending.jsonl' })), true);
  assert.equal(isSave(tool('Bash', { command: 'ls' })), false);
  assert.equal(isSave(assistantText()), false);
});

test('claude-session avisa da sessão anterior inativa com diretriz sem gravação', () => {
  const dir = mkdtempSync(join(tmpdir(), 'plumb-entry-'));
  transcript([user('sempre use centavos inteiros'), assistantText()], dir, 'anterior.jsonl', 2 * HOUR);
  const atual = transcript([user('oi')], dir, 'atual.jsonl');
  const out = handle('--claude-session', { transcript_path: atual, source: 'startup' });
  assert.match(out.hookSpecificOutput.additionalContext, /1 frase\(s\)/);
  assert.match(out.hookSpecificOutput.additionalContext, /\/plumb-dream/);
  assert.ok(handle('--claude-session', { transcript_path: atual }), 'sem source também avisa');
  assert.equal(handle('--claude-session', { transcript_path: atual, source: 'resume' }), null, 'resume e compact não repetem o aviso');
  assert.equal(handle('--claude-session', { transcript_path: atual, source: 'compact' }), null);
});

test('claude-session não avisa quando gravou, quando a sessão é paralela ainda viva, nem quando é antiga', () => {
  const dir2 = mkdtempSync(join(tmpdir(), 'plumb-entry-'));
  transcript([user('sempre use centavos inteiros'), assistantSave()], dir2, 'anterior.jsonl', 2 * HOUR);
  assert.equal(previousSessionNote({ transcript_path: join(dir2, 'atual.jsonl') }), null, 'gravou: nada a avisar');

  const dir3 = mkdtempSync(join(tmpdir(), 'plumb-entry-'));
  transcript([user('sempre use centavos inteiros')], dir3, 'viva.jsonl'); // mexida agora: outra sessão rodando
  assert.equal(previousSessionNote({ transcript_path: join(dir3, 'atual.jsonl') }), null, 'sessão paralela viva não conta');

  const dir4 = mkdtempSync(join(tmpdir(), 'plumb-entry-'));
  transcript([user('sempre use centavos inteiros')], dir4, 'velha.jsonl', 30 * 24 * HOUR);
  assert.equal(previousSessionNote({ transcript_path: join(dir4, 'atual.jsonl') }), null, 'sessão de 30 dias atrás não conta');
});

test('o script nunca trava a sessão: entrada inválida ou modo desconhecido saem vazios com código 0', () => {
  const run = (args, input) => spawnSync(process.execPath, [SCRIPT, ...args], { input, encoding: 'utf8' });
  for (const [args, input] of [[['--claude-prompt'], 'isto não é json'], [['--modo-novo'], '{}'], [['--claude-stop'], ''], [[], '{}']]) {
    const r = run(args, input);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  }
  const ok = run(['--claude-prompt'], '\uFEFF' + JSON.stringify({ prompt: 'oi', transcript_path: '/t.jsonl' }));
  assert.equal(ok.status, 0);
  assert.match(JSON.parse(ok.stdout).hookSpecificOutput.additionalContext, /skill `plumb`/);
});

test('o script roda também quando chamado por um link (dotfiles, junction): não fica mudo', () => {
  const base = mkdtempSync(join(tmpdir(), 'plumb-link-'));
  const real = join(base, 'real');
  mkdirSync(real);
  cpSync(HOOK_DIR, real, { recursive: true });
  const link = join(base, 'link');
  try {
    symlinkSync(real, link, 'junction'); // junction no Windows não pede administrador; no resto vira link comum
  } catch (err) {
    return; // sem permissão para criar link neste ambiente: o caso não se aplica
  }
  const r = spawnSync(process.execPath, [join(link, 'entry.mjs'), '--claude-prompt'], { input: '{}', encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\[Plumb\]/);
});
