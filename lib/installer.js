// Instalador do Plumb v7: copia skills, agentes e a instrução global para o Claude
// Code e/ou o Cursor e registra os hooks de entrada (roteador + pacote do .plumb + rede de segurança).
// O segundo cérebro v7 são ARQUIVOS (.plumb/knowledge) — não há MCP a registrar; o knowledge-os é
// opcional e, se o usuário quiser, entra via a skill plumb-find-mcps. Sem dependências.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const BLOCK_RE = /<!-- plumb:start -->[\s\S]*?<!-- plumb:end -->\n?/;

// ---------- lógica pura (testada em test/installer.test.js) ----------

/** Insere ou substitui o bloco Plumb, preservando o resto do arquivo. */
export function upsertBlock(text, block) {
  const clean = block.trim() + '\n';
  if (BLOCK_RE.test(text)) return text.replace(BLOCK_RE, () => clean);
  return text.trim() ? text.trimEnd() + '\n\n' + clean : clean;
}

/** Remove o bloco Plumb, preservando o resto do arquivo. */
export function removeBlock(text) {
  return text.replace(BLOCK_RE, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** Variante de um agente para o Cursor: sem aliases de modelo nem campos exclusivos do Claude Code. */
export function toCursorAgent(text) {
  return text
    .replace(/^model: \S+$/m, 'model: inherit')
    .replace(/^(effort|disallowedTools|readonly): .*\r?\n/gm, '');
}

// ---------- hook de entrada (roteador em toda mensagem + pacote do .plumb no início) ----------

const isEntryHook = (cmd = '') => /[\\/]skills[\\/]plumb[\\/]hooks[\\/]entry\.mjs/.test(cmd);
const ENTRY_EVENTS = [
  ['UserPromptSubmit', '--claude-prompt'],
  ['SessionStart', '--claude-session'],
  ['Stop', '--claude-stop'],
];

/**
 * Comando do hook de entrada. Caminho do Windows vira `/` e `$`, crase, aspas e barra são escapados
 * dentro das aspas. `raw` deixa o caminho como está (variável como $CLAUDE_PROJECT_DIR, ou relativo).
 */
export function entryCommand(script, mode, { raw = false } = {}) {
  let path = script;
  if (!raw) {
    if (/^[A-Za-z]:\\|^\\\\/.test(path)) path = path.replaceAll('\\', '/');
    path = path.replace(/(["$`\\])/g, '\\$1');
  }
  return `node "${path}" ${mode}`;
}

function withoutEntry(groups = []) {
  return groups
    .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isEntryHook(h.command)) }))
    .filter((g) => g.hooks.length);
}

/** Hooks do Plumb no Claude Code (UserPromptSubmit, SessionStart, Stop); idempotente, preserva os outros. */
export function upsertEntryHooks(settings, script, cmdOpts) {
  const out = { ...settings, hooks: { ...(settings.hooks || {}) } };
  for (const [event, mode] of ENTRY_EVENTS) {
    const groups = withoutEntry(out.hooks[event]);
    groups.push({ hooks: [{ type: 'command', command: entryCommand(script, mode, cmdOpts), timeout: 10 }] });
    out.hooks[event] = groups;
  }
  return out;
}

export function removeEntryHooks(settings) {
  if (!settings.hooks) return settings;
  const out = { ...settings, hooks: { ...settings.hooks } };
  for (const [event] of ENTRY_EVENTS) {
    if (!out.hooks[event]) continue;
    const groups = withoutEntry(out.hooks[event]);
    if (groups.length) out.hooks[event] = groups;
    else delete out.hooks[event];
  }
  if (!Object.keys(out.hooks).length) delete out.hooks;
  return out;
}

/** sessionStart do Cursor com o roteador + pacote (o Cursor não injeta contexto por prompt). */
export function upsertCursorEntryHook(config, script, cmdOpts) {
  const out = { version: 1, ...config, hooks: { ...(config.hooks || {}) } };
  const list = (out.hooks.sessionStart || []).filter((h) => !isEntryHook(h.command));
  list.push({ command: entryCommand(script, '--cursor-session', cmdOpts) });
  out.hooks.sessionStart = list;
  return out;
}

export function removeCursorEntryHook(config) {
  if (!config.hooks?.sessionStart) return config;
  const out = { ...config, hooks: { ...config.hooks } };
  const list = out.hooks.sessionStart.filter((h) => !isEntryHook(h.command));
  if (list.length) out.hooks.sessionStart = list;
  else delete out.hooks.sessionStart;
  if (!Object.keys(out.hooks).length) delete out.hooks;
  return out;
}

function readJson(file) {
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf8') || '{}');
  } catch {
    throw new Error(`${file} não é JSON válido; corrija e rode de novo`);
  }
}
function writeJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

// ---------- instalação ----------

const SKILLS = readdirSync(join(ROOT, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const AGENTS = readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'));
const INSTRUCTION = readFileSync(join(ROOT, 'global-instruction.md'), 'utf8');

// Cópias de terceiros com nome antigo (sem o prefixo plumb-): só removidas se forem a cópia do Plumb.
const LEGACY_SKILLS = ['find-docs', 'find-skills'];
// Skills do Plumb que saíram ou foram renomeadas no v7 (não são sobrescritas por terem nome diferente):
// a instalação nova as remove para não conviverem com as atuais e confundirem o agente.
const RENAMED_SKILLS = [
  'plumb', // o antigo orquestrador tinha SKILL.md; v7 não — mas a pasta plumb/ (hooks+references) continua
  'plumb-answer', 'plumb-capture', 'plumb-investigate', 'plumb-change', 'plumb-setup', 'plumb-align',
  'plumb-dream', 'plumb-retro',
];
const RENAMED_AGENTS = ['plumb-curator', 'plumb-security', 'plumb-verifier', 'plumb-dreamer'];

export function removeLegacy(skillsDir) {
  for (const s of LEGACY_SKILLS) {
    const source = join(skillsDir, s, 'SOURCE.md');
    if (existsSync(source) && readFileSync(source, 'utf8').includes('Alterações locais')) {
      rmSync(join(skillsDir, s), { recursive: true, force: true });
    }
  }
  // Remove o SKILL.md do orquestrador v6 em skills/plumb (se existir), preservando hooks/ e references/.
  const oldOrchestrator = join(skillsDir, 'plumb', 'SKILL.md');
  if (existsSync(oldOrchestrator)) rmSync(oldOrchestrator, { force: true });
  for (const s of RENAMED_SKILLS) {
    if (s === 'plumb') continue; // tratado acima (só o SKILL.md)
    rmSync(join(skillsDir, s), { recursive: true, force: true });
  }
}

/** Agentes do Plumb que foram renomeados; só os nossos, nunca homônimos de terceiros. */
export function removeRenamedAgents(agentsDir) {
  for (const a of RENAMED_AGENTS) {
    const file = join(agentsDir, `${a}.md`);
    if (existsSync(file) && readFileSync(file, 'utf8').includes('do Plumb')) {
      rmSync(file, { force: true });
    }
  }
}

const home = () => process.env.PLUMB_HOME || homedir();

function layout(tool, { project, tools }) {
  const base = project ? process.cwd() : home();
  if (tool === 'claude') {
    return {
      name: 'Claude Code',
      skills: join(base, '.claude', 'skills'),
      agents: join(base, '.claude', 'agents'),
      instruction: project ? null : join(base, '.claude', 'CLAUDE.md'),
      settings: join(base, '.claude', 'settings.json'),
    };
  }
  return {
    name: 'Cursor',
    skills: tools.includes('claude') ? null : join(base, '.cursor', 'skills'),
    agents: join(base, '.cursor', 'agents'),
    instruction: null,
    cursor: true,
    hooks: join(base, '.cursor', 'hooks.json'),
  };
}

/** Caminho do script de entrada que vai no comando do hook. */
function entryScript(l, opts) {
  if (opts.project) {
    // Com --both, o Cursor lê as skills de .claude/skills (l.skills é null); sozinho, de .cursor/skills.
    const skillsDir = l.skills ? (l.cursor ? '.cursor/skills' : '.claude/skills') : '.claude/skills';
    const rel = `${skillsDir}/plumb/hooks/entry.mjs`;
    return l.cursor ? { script: rel, raw: true } : { script: `$CLAUDE_PROJECT_DIR/${rel}`, raw: true };
  }
  const skills = l.skills || join(home(), '.claude', 'skills');
  return { script: join(skills, 'plumb', 'hooks', 'entry.mjs'), raw: false };
}

function installEntry(l, opts) {
  const { script, raw } = entryScript(l, opts);
  if (l.cursor) writeJson(l.hooks, upsertCursorEntryHook(readJson(l.hooks), script, { raw }));
  else writeJson(l.settings, upsertEntryHooks(readJson(l.settings), script, { raw }));
  console.log(`  entrada    hook de início de sessão${l.cursor ? '' : ', de cada mensagem e de fim de turno'} → ${script}`);
}

function uninstallEntry(l) {
  if (l.cursor) {
    if (existsSync(l.hooks)) writeJson(l.hooks, removeCursorEntryHook(readJson(l.hooks)));
  } else if (existsSync(l.settings)) {
    writeJson(l.settings, removeEntryHooks(readJson(l.settings)));
  }
}

function entryStatus(l) {
  const has = l.cursor
    ? (readJson(l.hooks).hooks?.sessionStart || []).some((h) => isEntryHook(h.command))
    : (readJson(l.settings).hooks?.UserPromptSubmit || []).some((g) => (g.hooks || []).some((h) => isEntryHook(h.command)));
  return `hook de entrada: ${has ? 'sim' : 'não'}`;
}

function install(tools, opts) {
  for (const tool of tools) {
    const l = layout(tool, { ...opts, tools });
    console.log(`\n${l.name}`);
    if (l.skills) {
      mkdirSync(l.skills, { recursive: true });
      removeLegacy(l.skills);
      for (const s of SKILLS) {
        const dest = join(l.skills, s);
        rmSync(dest, { recursive: true, force: true });
        cpSync(join(ROOT, 'skills', s), dest, { recursive: true });
      }
      writeFileSync(join(l.skills, 'plumb', '.version'), PKG.version + '\n');
      console.log(`  skills     ${l.skills}  (${SKILLS.length})`);
    } else {
      console.log('  skills     lidas de ~/.claude/skills');
    }
    mkdirSync(l.agents, { recursive: true });
    removeRenamedAgents(l.agents);
    for (const a of AGENTS) {
      const text = readFileSync(join(ROOT, 'agents', a), 'utf8');
      writeFileSync(join(l.agents, a), l.cursor ? toCursorAgent(text) : text);
    }
    console.log(`  agentes    ${l.agents}  (${AGENTS.length})`);
    if (l.instruction) {
      const current = existsSync(l.instruction) ? readFileSync(l.instruction, 'utf8') : '';
      mkdirSync(dirname(l.instruction), { recursive: true });
      writeFileSync(l.instruction, upsertBlock(current, INSTRUCTION));
      console.log(`  instrução  ${l.instruction}`);
    }
    installEntry(l, opts);
    if (l.cursor && !opts.project) {
      console.log('  instrução  o Cursor guarda regras globais só na interface; cole em');
      console.log('             Settings → Rules → User Rules:\n');
      console.log(INSTRUCTION.trim().split('\n').slice(1, -1).join('\n').replace(/^/gm, '    '));
    }
  }
  console.log(`\nPlumb ${PKG.version} instalado. O segundo cérebro são arquivos em .plumb/knowledge (opcional).`);
  console.log('Em cada repositório, rode /plumb-init.');
}

function uninstall(tools, opts) {
  for (const tool of tools) {
    const l = layout(tool, { ...opts, tools: [tool] });
    uninstallEntry(l);
    if (l.skills) {
      for (const s of SKILLS) rmSync(join(l.skills, s), { recursive: true, force: true });
      removeLegacy(l.skills);
    }
    for (const a of AGENTS) rmSync(join(l.agents, a), { force: true });
    removeRenamedAgents(l.agents);
    if (l.instruction && existsSync(l.instruction)) {
      const rest = removeBlock(readFileSync(l.instruction, 'utf8'));
      if (rest.trim()) writeFileSync(l.instruction, rest);
      else rmSync(l.instruction, { force: true });
    }
    console.log(`${l.name}: Plumb removido (os arquivos .plumb/knowledge ficam).`);
  }
  if (tools.includes('claude') && !tools.includes('cursor') && !opts.project) {
    const cursor = layout('cursor', { ...opts, tools: ['cursor'] });
    if (existsSync(cursor.hooks) && !existsSync(join(cursor.skills ?? '', 'plumb'))) uninstallEntry(cursor);
  }
}

function status(opts) {
  for (const tool of ['claude', 'cursor']) {
    const l = layout(tool, { ...opts, tools: [tool] });
    const vfile = join(l.skills, 'plumb', '.version');
    const version = existsSync(vfile) ? readFileSync(vfile, 'utf8').trim() : null;
    const agents = AGENTS.filter((a) => existsSync(join(l.agents, a))).length;
    let line = `${l.name.padEnd(12)} skills: ${version ? 'v' + version : 'não instaladas'} · agentes: ${agents}/${AGENTS.length}`;
    if (l.instruction) {
      const has = existsSync(l.instruction) && BLOCK_RE.test(readFileSync(l.instruction, 'utf8'));
      line += ` · instrução global: ${has ? 'sim' : 'não'}`;
    }
    line += ` · ${entryStatus(l)}`;
    console.log(line);
  }
  console.log('Cérebro:     arquivos em .plumb/knowledge (projeto) e ~/.plumb/knowledge (global) — opcional');
  console.log(`Pacote: v${PKG.version}`);
}

async function askTools() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('Instalar o Plumb para:\n  1) Claude Code\n  2) Cursor\n  3) Os dois\nEscolha [1]: ')).trim() || '1';
  rl.close();
  const map = { 1: ['claude'], 2: ['cursor'], 3: ['claude', 'cursor'] };
  if (!map[answer]) throw new Error(`opção inválida: ${answer}`);
  return map[answer];
}

const HELP = `plumb-harness v${PKG.version}

Uso:
  npx plumb-harness install   [--claude | --cursor | --both] [--project]
  npx plumb-harness uninstall [--claude | --cursor | --both] [--project]
  npx plumb-harness status    [--project]

Sem --claude/--cursor/--both, o install pergunta.
--project instala em .claude/ e .cursor/ do diretório atual, em vez do global.
O segundo cérebro v7 são arquivos (.plumb/knowledge); nada de MCP a registrar.`;

export async function main(argv) {
  const [cmd = 'help', ...rest] = argv;
  const flags = new Set(rest);
  const opts = { project: flags.has('--project') };
  let tools = flags.has('--both')
    ? ['claude', 'cursor']
    : [flags.has('--claude') && 'claude', flags.has('--cursor') && 'cursor'].filter(Boolean);

  if (cmd === 'install' || cmd === 'uninstall') {
    if (!tools.length) {
      if (!process.stdin.isTTY) throw new Error('informe --claude, --cursor ou --both.');
      tools = await askTools();
    }
    return cmd === 'install' ? install(tools, opts) : uninstall(tools, opts);
  }
  if (cmd === 'status') return status(opts);
  console.log(HELP);
}
