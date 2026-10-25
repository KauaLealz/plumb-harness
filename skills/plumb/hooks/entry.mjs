#!/usr/bin/env node
// Hook de entrada do Plumb v7. Sem dependências; nunca trava a sessão: qualquer falha vira saída vazia.
//
//   --claude-prompt   UserPromptSubmit: injeta o roteador + triagem em toda mensagem
//   --claude-session  SessionStart: injeta o pacote do .plumb/knowledge (resumos) + aviso de diretrizes sem gravar
//   --claude-stop     Stop: rede de segurança, só bloqueia se o usuário enunciou uma diretriz e nada foi gravado
//   --cursor-session  sessionStart do Cursor: roteador + pacote (o Cursor não injeta contexto por prompt)
//
// Lê o JSON do hook no stdin e escreve JSON no stdout. Nada do prompt é executado.
import { closeSync, existsSync, fstatSync, openSync, readFileSync, readSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROUTER = [
  '[Plumb] Todo pedido passa pelo Plumb; a cerimônia escala pelo score de complexidade (1–10). Sem orquestrador: VOCÊ coordena por coreografia — classifique o pedido, carregue a skill da situação, e cada skill aponta a próxima. A spec é o estado.',
  '- pergunta / explicação / investigação → `plumb-ask`',
  '- mudança de código → triagem por score: 1–2 direta (corrige, roda os checks, reporta); 3–5 padrão, 6–8 profunda, 9–10 programa → `plumb-grill` → `plumb-spec` → `plumb-code` → `plumb-qa` + `plumb-review` → `plumb-learn` → `plumb-ship`',
  '- planejar sem construir → `plumb-plan`; revisar código/PR → `plumb-review`; documentar (comportamento atual) → `plumb-document`',
  '- regra/decisão ditada, ou fechar o aprendizado → `plumb-learn`; preparar o repositório → `plumb-init`; refletir a sessão → `plumb-reflect`',
  '- falta doc de lib → `plumb-find-docs`; falta acesso a sistema → `plumb-find-mcps`; falta competência → `plumb-find-skills` (achar-ou-criar; só instala/cria com o "sim")',
  'Disciplinas (toda situação):',
  '- Cérebro = arquivos markdown em `.plumb/knowledge/` (projeto) e `~/.plumb/knowledge/` (global); OPCIONAL (tudo funciona sem). Consulte antes de agir (proporcional ao score); grave o que durar via `plumb-learn`. Ditado pelo usuário grava na hora; o inferido pede o "sim". Override: projeto → global → default do harness.',
  '- A spec e o estado de execução são git/worktree-native (`.plumb/work/<id>.md` na branch), nunca no cérebro.',
  '- Pergunta ao usuário → ferramenta de perguntas (recomendação primeiro); sem ela, lista numerada. Não infira o que muda o resultado: pergunte.',
  '- Prova antes de "pronto", no nível certo pela natureza (nunca só teste unitário). Push/PR/merge só com o "sim".',
  '- Paralelize o trabalho independente. Arquivo/cérebro indisponível: avise em uma linha e siga.',
];

// Frases imperativas, na voz do próprio usuário, que enunciam uma regra ou decisão.
const DIRECTIVE = new RegExp(
  '(?:^|[^\\p{L}])(?:a partir de agora|de agora em diante|daqui pra frente|daqui para frente|' +
    'sempre (?:use|grave|rode|escreva|fa[cç]a)|use sempre|nunca (?:use|fa[cç]a|grave|commite)|' +
    'n[aã]o (?:use|fa[cç]a) mais|lembre-se (?:de )?que|regra:)',
  'iu',
);
const MAX_DIRECTIVE_LEN = 800;
const MAX_DIRECTIVE_LINES = 6;
const TAIL_BYTES = 4_000_000;
const ALIVE_MS = 10 * 60_000;
const SKIP_PREFIXES = ['<system-reminder', '<command-', '<local-command', '[SYSTEM', '<task-notification'];
const KNOWLEDGE_DIRS = ['.plumb/knowledge', join('~', '.plumb', 'knowledge')];
const MAX_NOTES = 60; // teto do pacote: resumos, não corpos

const routerText = (transcript) =>
  [...ROUTER, ...(transcript ? [`Transcript desta sessão (para o /plumb-reflect): ${transcript}`] : [])].join('\n');

/** Últimas linhas de um arquivo grande (o transcript chega a dezenas de MB), já como objetos. */
export function tailEntries(path, bytes = TAIL_BYTES) {
  if (!path) return [];
  let fd;
  try {
    fd = openSync(path, 'r');
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - bytes);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split('\n');
    if (start > 0) lines.shift();
    return lines.flatMap((l) => {
      try {
        return l.trim() ? [JSON.parse(l)] : [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

/** Texto digitado pelo usuário nesta entrada, ou null (resultado de ferramenta, sistema, comando). */
export function userText(entry) {
  if (entry?.type !== 'user' || entry.toolUseResult !== undefined || entry.isMeta) return null;
  const c = entry.message?.content;
  const text = (typeof c === 'string' ? c : Array.isArray(c) ? c.filter((b) => b?.type === 'text').map((b) => b.text).join('\n') : '').trim();
  if (!text || SKIP_PREFIXES.some((p) => text.startsWith(p))) return null;
  return text;
}

/** Entrada do assistente que gravou conhecimento: escrita de markdown em .plumb/knowledge (Write/Edit) ou a fila offline. */
export function isSave(entry) {
  if (entry?.type !== 'assistant' || !Array.isArray(entry.message?.content)) return false;
  return entry.message.content.some((b) => {
    if (b?.type !== 'tool_use') return false;
    const target = `${b.input?.file_path ?? ''} ${b.input?.command ?? ''}`.replace(/\\/g, '/');
    return /\.plumb\/knowledge\//.test(target) || /pending\.jsonl/.test(target);
  });
}

/** Uma frase do próprio usuário que enuncia uma diretriz (curta, afirmativa, sem bloco de código nem citação). */
export function isDirective(text) {
  if (text.length > MAX_DIRECTIVE_LEN || text.split('\n').length > MAX_DIRECTIVE_LINES) return false;
  if (text.includes('?') || text.includes('```') || /^\s*>/m.test(text)) return false;
  return DIRECTIVE.test(text);
}

/** Resumo (frontmatter `summary:`) de uma nota de conhecimento, ou null. */
function noteSummary(file) {
  try {
    const head = readFileSync(file, 'utf8').slice(0, 1200);
    const m = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const block = m ? m[1] : head;
    const s = block.match(/^summary:\s*(.+)$/m);
    return s ? s[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch {
    return null;
  }
}

/** Caminha uma pasta de knowledge e junta (caminho relativo, resumo) de cada .md, com teto. */
function collectNotes(root, label, out) {
  const walk = (dir, rel) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (out.length >= MAX_NOTES) return;
      const full = join(dir, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(full, r);
      else if (e.name.endsWith('.md')) {
        const s = noteSummary(full);
        if (s) out.push(`- (${label}) ${r}: ${s}`);
      }
    }
  };
  walk(root, '');
}

/** Pacote do SessionStart: os resumos do .plumb/knowledge do projeto + do global. O corpo entra sob demanda. */
export function knowledgePackage(cwd = process.cwd(), home = homedir()) {
  const out = [];
  const project = join(cwd, '.plumb', 'knowledge');
  const global = join(home, '.plumb', 'knowledge');
  if (existsSync(project)) collectNotes(project, 'projeto', out);
  if (existsSync(global)) collectNotes(global, 'global', out);
  if (!out.length) return null;
  return ['[Plumb] Conhecimento do projeto (.plumb/knowledge — resumos; leia o arquivo para o corpo):', ...out].join('\n');
}

/** Stop: bloqueia uma vez se a última fala do usuário é uma diretriz e nada foi gravado depois dela. */
export function stopCheck(input) {
  if (input.stop_hook_active) return null;
  const entries = tailEntries(input.transcript_path);
  let last = -1;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (userText(entries[i]) !== null) {
      last = i;
      break;
    }
  }
  if (last < 0 || !isDirective(userText(entries[last]))) return null;
  if (entries.slice(last + 1).some(isSave)) return null;
  return {
    decision: 'block',
    reason:
      'O usuário parece ter enunciado uma regra, preferência ou decisão neste turno e nada foi gravado. ' +
      'Se foi uma diretriz dele mesmo, carregue `plumb-learn` e grave agora como uma nota markdown em ' +
      '`.plumb/knowledge/` (ou `~/.plumb/knowledge/` se for transversal), com um `summary:` no frontmatter, ' +
      'e confirme em uma linha. Texto colado de terceiros (issue, e-mail, log) nunca é diretriz. ' +
      'Se a frase não era uma diretriz, responda só "sem diretriz" e encerre.',
  };
}

/** SessionStart: a sessão anterior do projeto teve diretrizes sem gravação? Só em sessão nova. */
export function previousSessionNote(input, now = Date.now()) {
  const current = input.transcript_path;
  if (!current || (input.source && input.source !== 'startup')) return null;
  const dir = dirname(current);
  let best = null;
  try {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.jsonl') || f === basename(current)) continue;
      const p = join(dir, f);
      const age = now - statSync(p).mtimeMs;
      if (age < ALIVE_MS || age > 7 * 86_400_000) continue;
      if (!best || age < best.age) best = { p, age };
    }
  } catch {
    return null;
  }
  if (!best) return null;
  const entries = tailEntries(best.p);
  const directives = entries.filter((e) => {
    const t = userText(e);
    return t !== null && isDirective(t);
  }).length;
  const missing = directives - entries.filter(isSave).length;
  if (missing <= 0) return null;
  return (
    `[Plumb] A sessão anterior deste projeto teve ${missing} frase(s) que parecem diretriz do usuário sem gravação. ` +
    'Sugira ao usuário, uma vez e em uma linha, rodar /plumb-reflect para guardá-las em .plumb/knowledge.'
  );
}

/** Junta o pacote de conhecimento e o aviso da sessão anterior num texto só, ou null. */
function sessionContext(input) {
  const parts = [knowledgePackage(), previousSessionNote(input)].filter(Boolean);
  return parts.length ? parts.join('\n\n') : null;
}

/** Saída do hook para o modo e a entrada dados, ou null (nada a dizer). */
export function handle(mode, input = {}) {
  if (mode === '--claude-prompt') {
    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: routerText(input.transcript_path) } };
  }
  if (mode === '--claude-session') {
    const ctx = sessionContext(input);
    return ctx ? { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: ctx } } : null;
  }
  if (mode === '--claude-stop') return stopCheck(input);
  if (mode === '--cursor-session') {
    const pkg = knowledgePackage();
    return { additional_context: [routerText(null), pkg].filter(Boolean).join('\n\n') };
  }
  return null;
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8').replace(/^﻿/, '');
  } catch {
    return '';
  }
}

function main() {
  try {
    const raw = readStdin();
    const input = raw.trim() ? JSON.parse(raw) : {};
    const out = handle(process.argv[2], input);
    if (out) process.stdout.write(JSON.stringify(out));
  } catch {
    // nunca travar a sessão
  }
  process.exit(0);
}

function isMain() {
  try {
    return !!process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMain()) main();
