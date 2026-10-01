// Lógica do instalador do Plumb: copia skills, agentes e a instrução global
// para o Claude Code e/ou o Cursor. Sem dependências.
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
    .replace(/^(effort|disallowedTools): .*\r?\n/gm, '');
}

// ---------- instalação ----------

const SKILLS = readdirSync(join(ROOT, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const AGENTS = readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'));
const INSTRUCTION = readFileSync(join(ROOT, 'global-instruction.md'), 'utf8');

const home = () => process.env.PLUMB_HOME || homedir();

function layout(tool, { project, tools }) {
  const base = project ? process.cwd() : home();
  if (tool === 'claude') {
    return {
      name: 'Claude Code',
      skills: join(base, '.claude', 'skills'),
      agents: join(base, '.claude', 'agents'),
      instruction: project ? null : join(base, '.claude', 'CLAUDE.md'),
    };
  }
  return {
    name: 'Cursor',
    // O Cursor também lê .claude/skills: com os dois, as skills não são duplicadas.
    skills: tools.includes('claude') ? null : join(base, '.cursor', 'skills'),
    agents: join(base, '.cursor', 'agents'),
    instruction: null,
    cursor: true,
  };
}

function install(tools, opts) {
  for (const tool of tools) {
    const l = layout(tool, { ...opts, tools });
    console.log(`\n${l.name}`);
    if (l.skills) {
      mkdirSync(l.skills, { recursive: true });
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
    if (l.skills) for (const s of SKILLS) rmSync(join(l.skills, s), { recursive: true, force: true });
    for (const a of AGENTS) rmSync(join(l.agents, a), { force: true });
    if (l.instruction && existsSync(l.instruction)) {
      const rest = removeBlock(readFileSync(l.instruction, 'utf8'));
      if (rest.trim()) writeFileSync(l.instruction, rest);
      else rmSync(l.instruction, { force: true });
    }
    console.log(`${l.name}: Plumb removido.`);
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
    console.log(line);
  }
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
--project instala em .claude/ e .cursor/ do diretório atual, em vez do global.`;

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
