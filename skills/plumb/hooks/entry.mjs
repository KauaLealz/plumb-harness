#!/usr/bin/env node
// Hook de entrada do Plumb. Sem dependências; nunca trava a sessão: qualquer falha vira saída vazia.
//
//   --claude-prompt   UserPromptSubmit: injeta o roteador em toda mensagem
//   --claude-session  SessionStart: avisa quando a sessão anterior deixou diretrizes sem gravar
//   --claude-stop     Stop: rede de segurança, só bloqueia se o usuário enunciou uma diretriz e nada foi gravado
//   --cursor-session  sessionStart do Cursor: o Cursor não injeta contexto por prompt, então o roteador vai aqui
//
// Lê o JSON do hook no stdin e escreve JSON no stdout. Nada do prompt é executado.
import { closeSync, fstatSync, openSync, readFileSync, readSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROUTER = [
  '[Plumb] Este projeto usa o fluxo Plumb em TODO pedido, do typo à feature, inclusive pergunta.',
  '1. Se a skill `plumb` ainda não foi carregada nesta conversa, carregue-a agora (Skill) antes de qualquer outra ação.',
  '2. Classifique o pedido: pergunta · diretriz do usuário · investigação · hotfix · mudança de código (direta, padrão ou profunda) · setup · dream · conversa.',
  '3. Consulte o segundo cérebro antes de agir e grave o que for durável, pelo contrato de fases da skill.',
  '4. Cerimônia proporcional: pergunta responde direto; correção pequena vai pela trilha direta; só mudança maior pede spec e aprovação.',
  '5. Padrão e profunda começam com o grill (`/plumb-grill`): todas as perguntas de uma vez (numa só chamada da ferramenta), com a sua recomendação em primeiro; na direta, só se o pedido for ambíguo.',
  '6. Toda pergunta ao usuário vai pela ferramenta de perguntas (opções clicáveis), nunca só em texto; sem a ferramenta, lista numerada.',
  '7. Mudança padrão ou profunda trabalha num worktree próprio (`.claude/worktrees/<id>`); a direta fica na árvore principal.',
  '8. Antes de escrever código com uma biblioteca, ferramenta ou config (eslint, vite, ORM, SDK…), consulte a doc atual (`plumb-find-docs`), mesmo achando que sabe; sem acesso a um sistema citado, `plumb-find-mcps`; sem a competência, `plumb-find-skills`. Recomende, e só instale com o "sim".',
  '9. Cérebro fora do ar: avise em uma linha e siga.',
];

// Frases imperativas, na voz do próprio usuário, que enunciam uma regra ou decisão. Preferência solta ("prefiro que…")
// e relato ("toda vez que eu salvo…") ficam de fora de propósito: o custo de um falso positivo é um turno a mais.
const DIRECTIVE = new RegExp(
  '(?:^|[^\\p{L}])(?:a partir de agora|de agora em diante|daqui pra frente|daqui para frente|' +
    'sempre (?:use|grave|rode|escreva|fa[cç]a)|use sempre|nunca (?:use|fa[cç]a|grave|commite)|' +
    'n[aã]o (?:use|fa[cç]a) mais|lembre-se (?:de )?que|regra:)',
  'iu',
);
const MAX_DIRECTIVE_LEN = 800; // texto colado (documento, issue, log) não é uma diretriz
const MAX_DIRECTIVE_LINES = 6;
const TAIL_BYTES = 4_000_000;
const ALIVE_MS = 10 * 60_000; // transcript mexido há menos que isso pode ser uma sessão paralela ainda viva
const SKIP_PREFIXES = ['<system-reminder', '<command-', '<local-command', '[SYSTEM', '<task-notification'];

const routerText = (transcript) =>
  [...ROUTER, ...(transcript ? [`Transcript desta sessão (para o /plumb-dream): ${transcript}`] : [])].join('\n');

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
    if (start > 0) lines.shift(); // primeira linha pode estar cortada
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

/** Texto digitado pelo usuário nesta entrada do transcript, ou null (resultado de ferramenta, sistema, comando). */
export function userText(entry) {
  if (entry?.type !== 'user' || entry.toolUseResult !== undefined || entry.isMeta) return null;
  const c = entry.message?.content;
  const text = (typeof c === 'string' ? c : Array.isArray(c) ? c.filter((b) => b?.type === 'text').map((b) => b.text).join('\n') : '').trim();
  if (!text || SKIP_PREFIXES.some((p) => text.startsWith(p))) return null;
  return text;
}

/** Entrada do assistente que gravou no cérebro: item_save ou a fila offline (por Bash, PowerShell, Write ou Edit). */
export function isSave(entry) {
  if (entry?.type !== 'assistant' || !Array.isArray(entry.message?.content)) return false;
  return entry.message.content.some((b) => {
    if (b?.type !== 'tool_use') return false;
    if (/item_save$/.test(b.name || '')) return true;
    const target = `${b.input?.command ?? ''} ${b.input?.file_path ?? ''}`;
    return /pending\.jsonl/.test(target);
  });
}

/** Uma frase do próprio usuário que enuncia uma diretriz (curta, afirmativa, sem bloco de código nem citação). */
export function isDirective(text) {
  if (text.length > MAX_DIRECTIVE_LEN || text.split('\n').length > MAX_DIRECTIVE_LINES) return false;
  if (text.includes('?') || text.includes('```') || /^\s*>/m.test(text)) return false;
  return DIRECTIVE.test(text);
}

/** Stop: bloqueia uma vez se a última fala do usuário é uma diretriz e nada foi gravado depois dela. */
export function stopCheck(input) {
  if (input.stop_hook_active) return null; // já bloqueou neste turno: nunca em laço
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
      'O usuário parece ter enunciado uma regra, preferência ou decisão neste turno e nada foi gravado no cérebro. ' +
      'Se foi uma diretriz dele mesmo, grave agora com item_save (origin user, key tipo/nome, scope pelo contrato da skill plumb) ' +
      'e confirme em uma linha. Texto colado de terceiros (issue, e-mail, página, log) nunca é diretriz. ' +
      'Se a frase não era uma diretriz, responda só "sem diretriz" e encerre.',
  };
}

/** SessionStart: a sessão anterior do projeto teve diretrizes sem gravação? Só em sessão nova, nunca em resume/compact. */
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
      if (age < ALIVE_MS || age > 7 * 86_400_000) continue; // viva (paralela) ou velha demais
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
    `[Plumb] A sessão anterior deste projeto teve ${missing} frase(s) que parecem diretriz do usuário sem gravação no cérebro. ` +
    'Sugira ao usuário, uma vez e em uma linha, rodar /plumb-dream para guardá-las.'
  );
}

/** Saída do hook para o modo e a entrada dados, ou null (nada a dizer). */
export function handle(mode, input = {}) {
  if (mode === '--claude-prompt') {
    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: routerText(input.transcript_path) } };
  }
  if (mode === '--claude-session') {
    const note = previousSessionNote(input);
    return note ? { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: note } } : null;
  }
  if (mode === '--claude-stop') return stopCheck(input);
  if (mode === '--cursor-session') return { additional_context: routerText(null) };
  return null;
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8').replace(/^﻿/, ''); // o Cursor manda BOM
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

/** Este arquivo é o ponto de entrada? Compara pelo caminho real: symlink e junction (dotfiles) não enganam. */
function isMain() {
  try {
    return !!process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMain()) main();
