// Contrato das skills e agentes com o Knowledge OS v2.
//
// As skills falam com o servidor por nomes de ferramenta, tipos e conceitos. Se um texto citar uma ferramenta que não
// existe (ou um conceito que o v2 removeu), o agente tenta chamar e falha em runtime. Este teste trava isso.
//
// Fonte da lista: spec `change/brain-v2` (second-brain-mcp-server), resultado esperado 24. Quando o v2 mudar a lista,
// este é o lugar de atualizar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CRUD = ['list', 'create', 'update', 'merge', 'delete'];
export const TOOLS = new Set([
  ...['workspace', 'project', 'subject'].flatMap((n) => CRUD.map((a) => `${n}_${a}`)),
  'repo',
  'item_search', 'item_get', 'item_save', 'item_delete', 'item_feedback', 'item_graph',
  'relation_create', 'relation_delete',
  'tag_list', 'tag_create', 'tag_update', 'tag_delete',
  'connection_create', 'connection_list', 'connection_delete',
  'health_check',
]);
// Parâmetros que começam como nome de ferramenta mas não são ferramentas.
const PARAMS = new Set(['relation_types', 'connection_id']);

const FORBIDDEN = [
  [/context_get/, 'context_get saiu: o pacote vem do hook e item_search(repo=".") traz o essencial'],
  [/memory_class|importance|confidence/, 'memory_class, importance e confidence saíram do modelo'],
  [/\bvocabulary\(|\bbackup\(|\bartifact\(/, 'vocabulary, backup e artifact saíram das ferramentas'],
  [/\blabels?\b/, 'labels saíram (viraram tags)'],
  [/type"?:\s*"?(insight|procedure|knowledge|pattern|task)\b/, 'tipos antigos: use rule, howto, context, spec, secret'],
  [/\b(Geral|Global)\b/, 'Geral e Global não são mais lugares: o alcance vem do scope (scoped, workspace, global)'],
  [/\bchange\/[a-z<]/, 'a key da spec é spec/<id>'],
  [/\bdream\/last\b/, 'o registro do sonho é spec/dream-last'],
  [/\b(regra|decisao|padrao|contexto|segredo)\/[a-z<]/, 'keys em português: use rule/, context/, secret/ …'],
];

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return markdownFiles(p);
    return p.endsWith('.md') ? [p] : [];
  });
}

// As cópias de terceiros (find-docs, find-skills) são do fornecedor e não falam do cérebro.
const THIRD_PARTY = ['plumb-find-docs', 'plumb-find-skills'];
const files = [...markdownFiles(join(ROOT, 'skills')), ...markdownFiles(join(ROOT, 'agents'))].filter(
  (f) => !THIRD_PARTY.some((t) => f.includes(`${t}`)) && !f.endsWith('SOURCE.md'),
);

test('há skills e agentes para conferir', () => {
  assert.ok(files.length >= 10, `só ${files.length} arquivos`);
});

test('toda ferramenta do cérebro citada existe no v2', () => {
  const bad = [];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(/mcp__knowledge-os__([a-z_*]+)/g)) {
      const name = m[1].replace(/_\*$/, '');
      const prefix = [...TOOLS].some((t) => t === name || t.startsWith(`${name}_`));
      if (!prefix) bad.push(`${relative(ROOT, f)}: mcp__knowledge-os__${m[1]}`);
    }
    for (const m of text.matchAll(/\b((?:workspace|project|subject|item|relation|tag|label|connection|context|memory)_[a-z_]+)\b/g)) {
      const name = m[1];
      if (name.endsWith('_')) continue;
      if (TOOLS.has(name) || PARAMS.has(name) || name === 'scope_paths') continue;
      if (/^(workspace|project|subject)_\*$/.test(name)) continue;
      bad.push(`${relative(ROOT, f)}: ${name}`);
    }
  }
  assert.deepEqual(bad, [], `ferramentas ou campos que o v2 não tem:\n${bad.join('\n')}`);
});

test('nenhum texto usa conceito que o v2 removeu', () => {
  const bad = [];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const [re, why] of FORBIDDEN) {
      if (!why) continue;
      const m = text.match(re);
      if (m) bad.push(`${relative(ROOT, f)}: "${m[0]}" — ${why}`);
    }
  }
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

test('a referência do cérebro cobre as 32 ferramentas, os tipos e o scope', () => {
  const text = readFileSync(join(ROOT, 'skills', 'plumb', 'references', 'brain.md'), 'utf8');
  for (const t of ['item_search', 'item_get', 'item_save', 'item_delete', 'item_feedback', 'item_graph',
    'relation_create', 'relation_delete', 'tag_list', 'tag_create', 'tag_update', 'tag_delete',
    'connection_create', 'connection_list', 'connection_delete', 'health_check', '`repo`']) {
    assert.ok(text.includes(t), `brain.md não cita ${t}`);
  }
  for (const w of ['workspace_*', 'project_*', 'subject_*']) assert.ok(text.includes(w), `brain.md não cita ${w}`);
  for (const w of ['`rule`', '`howto`', '`context`', '`spec`', '`secret`', 'scoped', 'workspace', 'global', 'origin', 'supersedes']) {
    assert.ok(text.includes(w), `brain.md não cobre ${w}`);
  }
});

// Dimensionamento: o modelo é escolhido pelo orquestrador a cada despacho (parâmetro `model`), e o esforço
// vive no frontmatter porque a ferramenta de subagente não aceita `effort` por chamada.
const EFFORT = new Set(['low', 'medium', 'high', 'xhigh', 'max']);

function frontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, `${relative(ROOT, file)} sem frontmatter`);
  const fields = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

const agentFiles = readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md')).map((f) => join(ROOT, 'agents', f));

test('todo agente herda o modelo da sessão e declara esforço e teto de turnos', () => {
  const bad = [];
  for (const f of agentFiles) {
    const fm = frontmatter(f);
    const name = relative(ROOT, f);
    if (fm.model !== 'inherit') bad.push(`${name}: model=${fm.model} — deve ser inherit (o tier vem do despacho)`);
    if (!EFFORT.has(fm.effort)) bad.push(`${name}: effort=${fm.effort ?? '(ausente)'}`);
    if (!/^\d+$/.test(fm.maxTurns ?? '')) bad.push(`${name}: maxTurns=${fm.maxTurns ?? '(ausente)'}`);
  }
  assert.deepEqual(bad, [], `frontmatter fora do contrato:\n${bad.join('\n')}`);
});

test('a tabela de tiers cobre todo agente instalado, com modelo e esforço', () => {
  const text = readFileSync(join(ROOT, 'skills', 'plumb', 'references', 'communication.md'), 'utf8');
  for (const f of agentFiles) {
    const name = frontmatter(f).name;
    assert.ok(text.includes(name), `communication.md não dimensiona ${name}`);
  }
  for (const t of ['haiku', 'sonnet', 'opus']) assert.ok(text.includes(t), `communication.md não cita ${t}`);
  assert.ok(/sub[ai]|escalad/i.test(text), 'communication.md não diz quando subir de modelo');
  assert.ok(/des[çc]a|descer/i.test(text), 'communication.md não diz quando descer de modelo');
});

test('todo agente que recebe regra do cérebro devolve o que ajudou', () => {
  // Sem isso, o conhecimento mais usado (o que o orquestrador cola nos prompts) nunca recebe feedback.
  const bad = [];
  for (const f of agentFiles) {
    const name = frontmatter(f).name;
    if (name === 'plumb-scout') continue; // o batedor consulta fonte externa, não o cérebro
    const text = readFileSync(f, 'utf8');
    if (!/Do cérebro:|Feedback do que o cérebro trouxe:/.test(text)) bad.push(name);
  }
  assert.deepEqual(bad, [], `agentes sem retorno de feedback do cérebro: ${bad.join(', ')}`);
});

test('as lentes do revisor são as mesmas no fluxo, no contrato de prompt e no agente', () => {
  const lentes = ['correcao', 'seguranca', 'dados', 'concorrencia'];
  const files = {
    'plumb-reviewer.md': readFileSync(join(ROOT, 'agents', 'plumb-reviewer.md'), 'utf8'),
    'prompt-contract.md': readFileSync(join(ROOT, 'skills', 'plumb', 'references', 'prompt-contract.md'), 'utf8'),
    'SKILL.md': readFileSync(join(ROOT, 'skills', 'plumb', 'SKILL.md'), 'utf8'),
  };
  const bad = [];
  for (const [name, text] of Object.entries(files)) {
    for (const l of lentes) if (!text.includes(l)) bad.push(`${name} não cita a lente ${l}`);
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('o modelo de organização cobre os seis subtipos de regra e os cinco de contexto', () => {
  // O fluxo colapsava tudo em decision e troubleshoot porque os outros subtipos só existiam no setup.
  const text = readFileSync(join(ROOT, 'skills', 'plumb', 'references', 'brain-model.md'), 'utf8');
  const bad = [];
  for (const s of ['rule/code', 'rule/pattern', 'rule/security', 'rule/business', 'rule/process', 'rule/decision',
    'howto/procedure', 'howto/troubleshoot',
    'context/product', 'context/map', 'context/stack', 'context/glossary', 'context/environment']) {
    if (!text.includes(s)) bad.push(s);
  }
  for (const campo of ['keywords', 'scope_paths', 'summary', 'tags', 'links', 'origin', 'source']) {
    if (!text.includes(campo)) bad.push(`campo ${campo}`);
  }
  for (const r of ['implements', 'depends_on', 'supersedes']) if (!text.includes(r)) bad.push(`relação ${r}`);
  if (!text.includes('subject')) bad.push('agrupamento por subject');
  assert.deepEqual(bad, [], `brain-model.md não cobre: ${bad.join(', ')}`);
});

test('o fluxo aponta para o modelo de organização', () => {
  const skill = readFileSync(join(ROOT, 'skills', 'plumb', 'SKILL.md'), 'utf8');
  assert.ok(skill.includes('brain-model.md'), 'SKILL.md não aponta para o modelo de organização');
});

test('perguntas ao usuário vão pela ferramenta de perguntas, não em texto', () => {
  const all = [...markdownFiles(join(ROOT, 'skills')), ...markdownFiles(join(ROOT, 'agents'))]
    .filter((f) => !f.endsWith('SOURCE.md'));
  const bad = [];
  for (const f of all) {
    const m = readFileSync(f, 'utf8').match(/Posso seguir|ask whether to proceed|Would you like me to proceed/i);
    if (m) bad.push(`${relative(ROOT, f)}: "${m[0]}"`);
  }
  assert.deepEqual(bad, [], `pergunta só em texto:\n${bad.join('\n')}`);
});
