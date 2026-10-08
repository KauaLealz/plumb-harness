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
