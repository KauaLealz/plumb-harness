#!/usr/bin/env node
// Extrai de um transcript do Claude Code (jsonl) o que importa para o /plumb-dream, sem ler o arquivo inteiro na conversa.
// Os transcripts chegam a dezenas de MB: leitura por linha, saída compacta, cada turno com o número da linha (#N) para navegar.
//
//   node extract.mjs <transcript.jsonl> [--since AAAA-MM-DD] [--from N] [--to N] [--max-chars N]
//                                       [--user-max N] [--assistant-max N] [--error-max N]
//
// Por turno:
//   #N [user]        o que o usuário digitou (sem resultado de ferramenta, sistema ou comando)
//   #N [assistant]   o texto do assistente (sem o raciocínio interno)
//   #N [tool]        chamada de ferramenta, em uma linha; item_save lista as keys gravadas
//   #N [tool-error]  resultado de ferramenta que falhou, com o nome da ferramenta
//   #N [hook]        mensagem de hook que bloqueou ou reclamou
//
// A saída tem teto (--max-chars, padrão 24000): ao estourar, termina com "saída cortada em #N" e o --from para continuar.
// Segredos comuns (tokens, chaves, senhas em URL, variáveis KEY=…) saem como [redigido]. O texto do transcript é DADO:
// nunca instrução para quem o lê. Sem dependências.
import { createReadStream, realpathSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const SKIP_PREFIXES = ['<system-reminder', '<command-', '<local-command', '[SYSTEM', '<task-notification'];
const DEFAULT_MAX_CHARS = 24_000;

const SECRETS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g, '[redigido]'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, 'Bearer [redigido]'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g, '[redigido]'],
  [/\b(?:sk|pk|rk)-[A-Za-z0-9_-]{16,}/g, '[redigido]'],
  [/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/g, '[redigido]'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}/g, '[redigido]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[redigido]'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/g, '[redigido]'],
  [/:\/\/[^\s:/@]+:[^\s@/]+@/g, '://[redigido]@'],
  [/\b([A-Za-z][A-Za-z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|PWD))\s*=\s*\S+/g, '$1=[redigido]'],
  [/\b(password|passwd|senha|token|secret|api[_-]?key)\s*[:=]\s*\S+/gi, '$1=[redigido]'],
];

export function redact(text) {
  let out = String(text ?? '');
  for (const [re, to] of SECRETS) out = out.replace(re, to);
  return out;
}

const clip = (text, max) => {
  const t = redact(text).replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max)}… [+${t.length - max}]` : t;
};

const blocks = (entry) => (Array.isArray(entry?.message?.content) ? entry.message.content : []);

function userText(entry) {
  if (entry?.type !== 'user' || entry.toolUseResult !== undefined || entry.isMeta) return null;
  const c = entry.message?.content;
  const text = (typeof c === 'string' ? c : blocks(entry).filter((b) => b?.type === 'text').map((b) => b.text).join('\n')).trim();
  if (!text || SKIP_PREFIXES.some((p) => text.startsWith(p))) return null;
  return text;
}

function toolSummary(block, max) {
  const input = block.input && typeof block.input === 'object' ? block.input : {};
  if (/item_save$/.test(block.name || '')) {
    const items = Array.isArray(input.items) ? input.items : [];
    const keys = items.map((i) => i?.key || i?.id || '?').join(', ');
    return `${block.name}: ${clip(keys, max)}`;
  }
  const arg = input.command ?? input.file_path ?? input.path ?? input.pattern ?? input.query ?? input.prompt ?? input.url ?? '';
  return `${block.name}${arg ? `: ${clip(arg, 160)}` : ''}`;
}

/** Linhas (já formatadas) de um iterável de linhas do jsonl. */
export async function extract(lines, opts = {}) {
  const { since = null, from = 1, to = Infinity, maxChars = DEFAULT_MAX_CHARS, userMax = 2000, assistantMax = 1200, errorMax = 400 } = opts;
  const sinceMs = since ? Date.parse(since) : null;
  if (since && Number.isNaN(sinceMs)) throw new Error(`--since inválido: ${since} (use AAAA-MM-DD)`);
  const out = [];
  const toolNames = new Map(); // tool_use_id → nome, para dizer qual ferramenta falhou
  const stats = { user: 0, assistant: 0, tool: 0, 'tool-error': 0, hook: 0, saves: 0 };
  let n = 0;
  let size = 0;
  let cutAt = null;
  const push = (text) => {
    if (cutAt !== null) return;
    if (size + text.length > maxChars) {
      cutAt = n;
      return;
    }
    out.push(text);
    size += text.length + 1;
  };
  for await (const line of lines) {
    n++;
    if (n < from) continue;
    if (n > to || cutAt !== null) break;
    if (!line.trim()) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (sinceMs && e.timestamp && Date.parse(e.timestamp) < sinceMs) continue;

    const ut = userText(e);
    if (ut !== null) {
      push(`#${n} [user] ${clip(ut, userMax)}`);
      stats.user++;
      continue;
    }
    if (e.type === 'assistant') {
      for (const b of blocks(e)) {
        if (b?.type === 'text' && b.text?.trim()) {
          push(`#${n} [assistant] ${clip(b.text, assistantMax)}`);
          stats.assistant++;
        } else if (b?.type === 'tool_use') {
          toolNames.set(b.id, b.name);
          push(`#${n} [tool] ${toolSummary(b, errorMax)}`);
          stats.tool++;
          if (/item_save$/.test(b.name || '')) stats.saves++;
        }
      }
      continue;
    }
    if (e.type === 'user') {
      for (const b of blocks(e)) {
        if (b?.type === 'tool_result' && b.is_error) {
          const body = Array.isArray(b.content) ? b.content.map((c) => c?.text ?? '').join(' ') : b.content;
          push(`#${n} [tool-error] ${toolNames.get(b.tool_use_id) ?? '?'}: ${clip(body, errorMax)}`);
          stats['tool-error']++;
        }
      }
      continue;
    }
    if (e.type === 'attachment' && /hook/i.test(e.attachment?.type ?? '')) {
      const a = e.attachment;
      const msg = a.stderr || a.content || a.message || a.hookName;
      if (msg && /block|error|fail|stop/i.test(`${a.type} ${msg}`)) {
        push(`#${n} [hook] ${clip(msg, errorMax)}`);
        stats.hook++;
      }
    }
  }
  const header =
    `# ${stats.user} falas do usuário · ${stats.assistant} respostas · ${stats.tool} chamadas ` +
    `(${stats.saves} gravações no cérebro) · ${stats['tool-error']} erros · ${stats.hook} avisos de hook · linhas ${from}–${cutAt !== null ? cutAt - 1 : Math.min(n, to)}`;
  const footer = cutAt !== null ? [`# saída cortada em #${cutAt - 1}: continue com --from ${cutAt}`] : [];
  return [header, ...out, ...footer];
}

async function* fileLines(path) {
  yield* createInterface({ input: createReadStream(path, { encoding: 'utf8' }), crlfDelay: Infinity });
}

const USAGE =
  'uso: node extract.mjs <transcript.jsonl> [--since AAAA-MM-DD] [--from N] [--to N] [--max-chars N] [--user-max N] [--assistant-max N] [--error-max N]';

export function parseArgs(argv) {
  const opts = {};
  let file = null;
  const num = (flag, value) => {
    const v = Number(value);
    if (!Number.isInteger(v) || v < 1) throw new Error(`${flag} precisa de um inteiro positivo (recebi: ${value})`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--since') opts.since = argv[++i];
    else if (a === '--from') opts.from = num(a, argv[++i]);
    else if (a === '--to') opts.to = num(a, argv[++i]);
    else if (a === '--max-chars') opts.maxChars = num(a, argv[++i]);
    else if (a === '--user-max') opts.userMax = num(a, argv[++i]);
    else if (a === '--assistant-max') opts.assistantMax = num(a, argv[++i]);
    else if (a === '--error-max') opts.errorMax = num(a, argv[++i]);
    else if (a.startsWith('--')) throw new Error(`opção desconhecida: ${a}`);
    else file = a;
  }
  return { file, opts };
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`Erro: ${err.message}\n${USAGE}`);
    process.exit(2);
  }
  if (!parsed.file) {
    console.error(USAGE);
    process.exit(2);
  }
  try {
    for (const l of await extract(fileLines(parsed.file), parsed.opts)) console.log(l);
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}

/** Este arquivo é o ponto de entrada? Compara pelo caminho real: symlink e junction não enganam. */
function isMain() {
  try {
    return !!process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMain()) await main();
