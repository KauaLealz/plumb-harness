// Lógica do instalador do Plumb: copia skills, agentes e a instrução global
// para o Claude Code e/ou o Cursor e registra o segundo cérebro (MCP + hook).
// Sem dependências.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
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

/** Variante de um agente para o Cursor: sem aliases de modelo nem campos exclusivos do Claude Code.
 * `readonly: true` também sai: no Cursor ele roda o agente em Ask mode, que bloqueia shell e MCP —
 * o verificador não roda a suíte, o revisor não lê o diff e o curador não consulta o cérebro.
 * A regra "não edite" continua no texto de cada agente. */
export function toCursorAgent(text) {
  return text
    .replace(/^model: \S+$/m, 'model: inherit')
    .replace(/^(effort|disallowedTools|readonly): .*\r?\n/gm, '');
}

// ---------- segundo cérebro (Knowledge OS) ----------

export const BRAIN = 'knowledge-os';
const BRAIN_ENV = { KNOWLEDGE_OS_TOOLSET: 'agent', LOG_LEVEL: 'WARNING' };
const isBrainHook = (cmd = '') => /context --hook (claude|cursor)/.test(cmd);

/** Separa uma linha de comando em tokens, respeitando aspas duplas. */
export function splitCommand(line) {
  return [...line.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => m[1] ?? m[2]);
}

/** Entrada do servidor no formato mcpServers (Cursor e .mcp.json do projeto): sem shell, o
 * executável e os argumentos vão separados. */
export function upsertMcpServer(config, commandLine) {
  const [command, ...args] = splitCommand(commandLine);
  const out = { ...config, mcpServers: { ...(config.mcpServers || {}) } };
  out.mcpServers[BRAIN] = { command, args, env: { ...BRAIN_ENV } };
  return out;
}

/** Hook SessionStart do Claude Code que injeta o pacote de contexto; idempotente. */
export function upsertClaudeHook(settings, command) {
  const out = { ...settings, hooks: { ...(settings.hooks || {}) } };
  const groups = (out.hooks.SessionStart || [])
    .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isBrainHook(h.command)) }))
    .filter((g) => g.hooks.length);
  groups.push({ hooks: [{ type: 'command', command: `${command} context --hook claude`, timeout: 20 }] });
  out.hooks.SessionStart = groups;
  return out;
}

export function removeClaudeHook(settings) {
  if (!settings.hooks?.SessionStart) return settings;
  const out = { ...settings, hooks: { ...settings.hooks } };
  const groups = out.hooks.SessionStart
    .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isBrainHook(h.command)) }))
    .filter((g) => g.hooks.length);
  if (groups.length) out.hooks.SessionStart = groups;
  else delete out.hooks.SessionStart;
  if (!Object.keys(out.hooks).length) delete out.hooks;
  return out;
}

/** Hook sessionStart do Cursor (hooks.json); idempotente. */
export function upsertCursorHook(config, command) {
  const out = { version: 1, ...config, hooks: { ...(config.hooks || {}) } };
  const list = (out.hooks.sessionStart || []).filter((h) => !isBrainHook(h.command));
  list.push({ command: `${command} context --hook cursor` });
  out.hooks.sessionStart = list;
  return out;
}

export function removeCursorHook(config) {
  if (!config.hooks?.sessionStart) return config;
  const out = { ...config, hooks: { ...config.hooks } };
  const list = out.hooks.sessionStart.filter((h) => !isBrainHook(h.command));
  if (list.length) out.hooks.sessionStart = list;
  else delete out.hooks.sessionStart;
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

const brainCmd = () => process.env.PLUMB_BRAIN_CMD || 'knowledge-mcp';
const claudeCmd = () => process.env.PLUMB_CLAUDE_CMD || 'claude';

function run(cmd, args) {
  const r = spawnSync([cmd, ...args].join(' '), { encoding: 'utf8', shell: true, timeout: 60000 });
  return { ok: r.status === 0, out: `${r.stdout || ''}${r.stderr || ''}`.trim() };
}

/** Versão do `knowledge-mcp` instalado, ou null. */
function brainVersion() {
  const r = run(brainCmd(), ['--version']);
  const m = r.ok && r.out.match(/knowledge-mcp (\S+)/);
  return m ? m[1] : null;
}

function installBrain(l, opts) {
  const version = brainVersion();
  if (!version) {
    console.log('  cérebro    `knowledge-mcp` não encontrado — o Plumb depende do segundo cérebro.');
    console.log('             Instale o Knowledge OS (uv tool install <repositório do Knowledge OS>)');
    console.log('             e rode este install de novo para registrar o MCP e o hook.');
    return;
  }
  const cmd = brainCmd();
  if (l.cursor) {
    writeJson(l.mcp, upsertMcpServer(readJson(l.mcp), cmd));
    writeJson(l.hooks, upsertCursorHook(readJson(l.hooks), cmd));
  } else {
    if (opts.project) {
      writeJson(l.mcp, upsertMcpServer(readJson(l.mcp), cmd));
    } else {
      run(claudeCmd(), ['mcp', 'remove', '--scope', 'user', BRAIN]);
      const env = Object.entries(BRAIN_ENV).flatMap(([k, v]) => ['-e', `${k}=${v}`]);
      const r = run(claudeCmd(), ['mcp', 'add', '--scope', 'user', BRAIN, ...env, '--', cmd]);
      if (!r.ok) {
        console.log(`  cérebro    não registrei o MCP (${r.out.split('\n')[0] || 'claude não encontrado'}). Rode:`);
        console.log(`             claude mcp add --scope user ${BRAIN} ${env.join(' ')} -- ${cmd}`);
      }
    }
    writeJson(l.settings, upsertClaudeHook(readJson(l.settings), cmd));
  }
  console.log(`  cérebro    knowledge-mcp ${version} · MCP ${BRAIN} (perfil agent) · hook de início de sessão`);
}

function uninstallBrain(l) {
  if (l.cursor) {
    if (existsSync(l.hooks)) writeJson(l.hooks, removeCursorHook(readJson(l.hooks)));
  } else if (existsSync(l.settings)) {
    writeJson(l.settings, removeClaudeHook(readJson(l.settings)));
  }
}

function brainStatus(l) {
  const hooked = l.cursor
    ? (readJson(l.hooks).hooks?.sessionStart || []).some((h) => isBrainHook(h.command))
    : (readJson(l.settings).hooks?.SessionStart || []).some((g) => (g.hooks || []).some((h) => isBrainHook(h.command)));
  return `hook do cérebro: ${hooked ? 'sim' : 'não'}`;
}

// ---------- instalação ----------

const SKILLS = readdirSync(join(ROOT, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const AGENTS = readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'));
const INSTRUCTION = readFileSync(join(ROOT, 'global-instruction.md'), 'utf8');

// Nomes usados por versões anteriores do Plumb. Só são removidos se a pasta
// for a cópia do Plumb (SOURCE.md com "Alterações locais"), nunca uma skill
// homônima instalada por outra via.
const LEGACY_SKILLS = ['find-docs', 'find-skills'];
export function removeLegacy(skillsDir) {
  for (const s of LEGACY_SKILLS) {
    const source = join(skillsDir, s, 'SOURCE.md');
    if (existsSync(source) && readFileSync(source, 'utf8').includes('Alterações locais')) {
      rmSync(join(skillsDir, s), { recursive: true, force: true });
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
      mcp: project ? join(base, '.mcp.json') : null,
    };
  }
  return {
    name: 'Cursor',
    // O Cursor também lê .claude/skills: com os dois, as skills não são duplicadas.
    skills: tools.includes('claude') ? null : join(base, '.cursor', 'skills'),
    agents: join(base, '.cursor', 'agents'),
    instruction: null,
    cursor: true,
    mcp: join(base, '.cursor', 'mcp.json'),
    hooks: join(base, '.cursor', 'hooks.json'),
  };
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
      console.log(`  skills     ${l.skills}  (${SKILLS.join(', ')})`);
    } else {
      console.log('  skills     lidas de ~/.claude/skills');
    }
    mkdirSync(l.agents, { recursive: true });
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
    if (opts.brain) installBrain(l, opts);
    if (l.cursor && !opts.project) {
      console.log('  instrução  o Cursor guarda regras globais só na interface; cole em');
      console.log('             Settings → Rules → User Rules:\n');
      console.log(INSTRUCTION.trim().split('\n').slice(1, -1).join('\n').replace(/^/gm, '    '));
    }
  }
  console.log(`\nPlumb ${PKG.version} instalado. Em cada repositório, rode /plumb-setup.`);
}

function uninstall(tools, opts) {
  for (const tool of tools) {
    const l = layout(tool, { ...opts, tools: [tool] });
    if (l.skills) {
      for (const s of SKILLS) rmSync(join(l.skills, s), { recursive: true, force: true });
      removeLegacy(l.skills);
    }
    for (const a of AGENTS) rmSync(join(l.agents, a), { force: true });
    uninstallBrain(l);
    if (l.instruction && existsSync(l.instruction)) {
      const rest = removeBlock(readFileSync(l.instruction, 'utf8'));
      if (rest.trim()) writeFileSync(l.instruction, rest);
      else rmSync(l.instruction, { force: true });
    }
    console.log(`${l.name}: Plumb removido (o MCP ${BRAIN} e os dados do cérebro ficam).`);
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
    line += ` · ${brainStatus(l)}`;
    console.log(line);
  }
  const v = brainVersion();
  console.log(`Cérebro:     ${v ? 'knowledge-mcp ' + v : 'knowledge-mcp não encontrado — instale o Knowledge OS'}`);
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
  npx plumb-harness install   [--claude | --cursor | --both] [--project] [--no-brain]
  npx plumb-harness uninstall [--claude | --cursor | --both] [--project]
  npx plumb-harness status    [--project]

Sem --claude/--cursor/--both, o install pergunta.
--project instala em .claude/ e .cursor/ do diretório atual, em vez do global.
--no-brain não registra o segundo cérebro (MCP knowledge-os e hook de início de sessão).`;

export async function main(argv) {
  const [cmd = 'help', ...rest] = argv;
  const flags = new Set(rest);
  const opts = { project: flags.has('--project'), brain: !flags.has('--no-brain') };
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
