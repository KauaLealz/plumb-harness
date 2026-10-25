// Contrato interno do Plumb v7.
//
// O v7 não depende de um servidor de cérebro: a memória são arquivos em .plumb/knowledge. Este teste
// trava regressões para o modelo v6 (skills antigas, ferramentas do cérebro MCP, conceitos removidos)
// e garante a estrutura das skills (SKILL.md + playbook.md) e a disciplina de perguntas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return markdownFiles(p);
    return p.endsWith('.md') ? [p] : [];
  });
}

// Cópias de terceiros (upstream): não seguem o nosso modelo de conteúdo.
const THIRD_PARTY = ['plumb-find-docs', 'plumb-find-skills'];
const allMd = [...markdownFiles(SKILLS_DIR), ...markdownFiles(join(ROOT, 'agents'))].filter((f) => !f.endsWith('SOURCE.md'));
const ours = allMd.filter((f) => !THIRD_PARTY.some((t) => f.includes(t)));

// Skills que, no v7, têm SKILL.md + playbook.md (as de passo e apoio; não os find-* nem o core plumb).
const WITH_PLAYBOOK = [
  'plumb-ask', 'plumb-grill', 'plumb-spec', 'plumb-code', 'plumb-qa', 'plumb-review',
  'plumb-learn', 'plumb-ship', 'plumb-plan', 'plumb-document', 'plumb-init', 'plumb-reflect',
];

const FORBIDDEN = [
  [/plumb-(change|answer|capture|investigate|setup|align|dream|retro)\b/, 'skill do v6 removida/renomeada (v7: ask, grill, spec, code, qa, review, learn, ship, plan, document, init, reflect)'],
  [/mcp__knowledge-os__item_(save|get|search|delete|graph)/, 'o v7 não grava/lê por ferramenta do cérebro MCP — a memória são arquivos em .plumb/knowledge'],
  [/\bitem_feedback\b/, 'o feedback saiu: item errado/velho, corrige ou remove o arquivo'],
  [/"?subtype"?\s*[:=]/, 'subtype saiu: a nuance vai em tags/pastas'],
  [/\bscope:\s*["'`(]/, 'scope saiu: o alcance é a hierarquia de pastas (.plumb do projeto vs global)'],
  [/type"?:\s*"?(insight|procedure|knowledge|spec)\b/, 'tipos fixos saíram no v7: o cérebro é markdown livre'],
];

test('há skills e agentes para conferir', () => {
  assert.ok(ours.length >= 20, `só ${ours.length} arquivos`);
});

test('cada skill de passo/apoio tem SKILL.md + playbook.md', () => {
  const bad = [];
  for (const s of WITH_PLAYBOOK) {
    if (!existsSync(join(SKILLS_DIR, s, 'SKILL.md'))) bad.push(`${s}: falta SKILL.md`);
    if (!existsSync(join(SKILLS_DIR, s, 'playbook.md'))) bad.push(`${s}: falta playbook.md`);
  }
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

test('as skills de passo/apoio são invocáveis pelo modelo (sem disable-model-invocation, para a coreografia)', () => {
  const bad = [];
  for (const s of WITH_PLAYBOOK) {
    const text = readFileSync(join(SKILLS_DIR, s, 'SKILL.md'), 'utf8');
    if (/disable-model-invocation:\s*true/.test(text)) bad.push(s);
  }
  assert.deepEqual(bad, [], `skills com disable-model-invocation (quebram a coreografia): ${bad.join(', ')}`);
});

test('nenhum texto usa skill do v6 nem conceito removido', () => {
  const bad = [];
  for (const f of ours) {
    const text = readFileSync(f, 'utf8');
    for (const [re, why] of FORBIDDEN) {
      const m = text.match(re);
      if (m) bad.push(`${relative(ROOT, f)}: "${m[0]}" — ${why}`);
    }
  }
  assert.deepEqual(bad, [], `\n${bad.join('\n')}`);
});

test('perguntas ao usuário vão pela ferramenta de perguntas, não em texto', () => {
  const bad = [];
  for (const f of allMd) {
    const m = readFileSync(f, 'utf8').match(/Posso seguir\?|ask whether to proceed|Would you like me to proceed/i);
    if (m) bad.push(`${relative(ROOT, f)}: "${m[0]}"`);
  }
  assert.deepEqual(bad, [], `pergunta só em texto:\n${bad.join('\n')}`);
});
