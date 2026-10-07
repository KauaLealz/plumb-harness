import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  removeBlock, removeClaudeHook, toCursorAgent, upsertBlock, upsertClaudeHook, upsertCursorHook, upsertMcpServer,
} from '../lib/installer.js';

const CLI = fileURLToPath(new URL('../bin/cli.js', import.meta.url));

// `knowledge-mcp` e `claude` falsos: respondem à versão e registram os argumentos recebidos.
function fakes(home) {
  const bin = join(home, 'bin');
  mkdirSync(bin, { recursive: true });
  const brain = join(bin, 'brain.mjs');
  writeFileSync(brain, "console.log('knowledge-mcp 9.9.9');\n");
  const claude = join(bin, 'claude.mjs');
  const log = JSON.stringify(join(home, 'claude-calls.txt'));
  writeFileSync(claude, `import { appendFileSync } from 'node:fs';\nappendFileSync(${log}, process.argv.slice(2).join(' ') + '\\n');\n`);
  const q = (f) => `"${process.execPath}" "${f}"`;
  return { PLUMB_HOME: home, PLUMB_BRAIN_CMD: q(brain), PLUMB_CLAUDE_CMD: q(claude) };
}
const BLOCK = '<!-- plumb:start -->\n## Plumb\nuse a skill\n<!-- plumb:end -->\n';

test('upsertBlock acrescenta preservando o conteúdo', () => {
  const out = upsertBlock('# Minhas regras\n- PT-BR\n', BLOCK);
  assert.ok(out.startsWith('# Minhas regras\n- PT-BR\n\n<!-- plumb:start -->'));
});

test('upsertBlock substitui sem duplicar e sem interpretar $', () => {
  const once = upsertBlock('# x\n', BLOCK);
  const twice = upsertBlock(once, BLOCK.replace('use a skill', () => 'custa $1 e $&'));
  assert.equal(twice.match(/plumb:start/g).length, 1);
  assert.ok(twice.includes('custa $1 e $&'));
});

test('removeBlock tira só o bloco', () => {
  assert.equal(removeBlock(upsertBlock('# x\n', BLOCK)), '# x\n');
});

test('toCursorAgent troca o modelo e remove campos do Claude Code', () => {
  const src = '---\nname: a\ndisallowedTools: Write, Edit\nreadonly: true\nmodel: sonnet\neffort: low\n---\nbody\n';
  assert.equal(toCursorAgent(src), '---\nname: a\nmodel: inherit\n---\nbody\n');
});

test('install --both global: skills, agentes e instrução; idempotente; uninstall desfaz', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  mkdirSync(join(home, '.claude'));
  writeFileSync(join(home, '.claude', 'CLAUDE.md'), '# Minhas regras\n');
  const run = (...args) =>
    execFileSync(process.execPath, [CLI, ...args], { env: { ...process.env, ...fakes(home) }, encoding: 'utf8' });

  run('install', '--both');
  run('install', '--both');
  assert.ok(existsSync(join(home, '.claude', 'skills', 'plumb', 'SKILL.md')));
  assert.ok(existsSync(join(home, '.claude', 'skills', 'plumb-setup', 'references', 'catalog.md')));
  assert.ok(!existsSync(join(home, '.cursor', 'skills')), 'com os dois, o Cursor lê .claude/skills');
  assert.match(readFileSync(join(home, '.cursor', 'agents', 'plumb-explorer.md'), 'utf8'), /^model: inherit$/m);
  // os agentes herdam o modelo da sessão; o tier por papel fica no corpo, não no frontmatter
  assert.match(readFileSync(join(home, '.claude', 'agents', 'plumb-explorer.md'), 'utf8'), /^model: inherit$/m);
  const md = readFileSync(join(home, '.claude', 'CLAUDE.md'), 'utf8');
  assert.equal(md.match(/plumb:start/g).length, 1);
  assert.ok(md.startsWith('# Minhas regras'));
  assert.match(run('status'), /Claude Code\s+skills: v\d.*instrução global: sim · hook do cérebro: sim/);

  const settings = JSON.parse(readFileSync(join(home, '.claude', 'settings.json'), 'utf8'));
  assert.equal(settings.hooks.SessionStart.length, 1, 'hook não duplica');
  assert.match(settings.hooks.SessionStart[0].hooks[0].command, /context --hook claude$/);
  const calls = readFileSync(join(home, 'claude-calls.txt'), 'utf8');
  assert.match(calls, /mcp add --scope user knowledge-os -e LOG_LEVEL=WARNING -- /);
  const cursorMcp = JSON.parse(readFileSync(join(home, '.cursor', 'mcp.json'), 'utf8'));
  assert.equal(cursorMcp.mcpServers['knowledge-os'].env.LOG_LEVEL, 'WARNING');
  const cursorHooks = JSON.parse(readFileSync(join(home, '.cursor', 'hooks.json'), 'utf8'));
  assert.equal(cursorHooks.hooks.sessionStart.length, 1);

  run('uninstall', '--both');
  assert.ok(!existsSync(join(home, '.claude', 'skills', 'plumb')));
  assert.ok(!existsSync(join(home, '.cursor', 'agents', 'plumb-explorer.md')));
  assert.equal(readFileSync(join(home, '.claude', 'CLAUDE.md'), 'utf8'), '# Minhas regras\n');
});

test('install --cursor sozinho grava as skills em ~/.cursor/skills', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  execFileSync(process.execPath, [CLI, 'install', '--cursor'], { env: { ...process.env, ...fakes(home) }, encoding: 'utf8' });
  assert.ok(existsSync(join(home, '.cursor', 'skills', 'plumb', 'SKILL.md')));
  assert.ok(!existsSync(join(home, '.claude')), 'não toca no Claude Code');
});

test('install remove as cópias antigas do Plumb (find-docs/find-skills) e preserva homônimas de terceiros', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const dir = join(home, '.claude', 'skills');
  mkdirSync(join(dir, 'find-docs'), { recursive: true });
  writeFileSync(join(dir, 'find-docs', 'SOURCE.md'), '- Alterações locais: nenhuma');
  mkdirSync(join(dir, 'find-skills'), { recursive: true });
  writeFileSync(join(dir, 'find-skills', 'SKILL.md'), ['---', 'name: find-skills', '---', ''].join(String.fromCharCode(10)));
  execFileSync(process.execPath, [CLI, 'install', '--claude', '--no-brain'], { env: { ...process.env, PLUMB_HOME: home }, encoding: 'utf8' });
  assert.ok(!existsSync(join(dir, 'find-docs')), 'cópia antiga do Plumb removida');
  assert.ok(existsSync(join(dir, 'find-skills', 'SKILL.md')), 'skill de terceiro preservada');
  assert.ok(existsSync(join(dir, 'plumb-find-docs', 'SKILL.md')));
  assert.ok(existsSync(join(dir, 'plumb-find-skills', 'SKILL.md')));
});

test('install sem ferramenta e sem terminal interativo pede a flag', () => {
  assert.throws(
    () => execFileSync(process.execPath, [CLI, 'install'], { input: '', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }),
    /informe --claude, --cursor ou --both/,
  );
});
test('hook do Claude preserva os outros hooks e não duplica', () => {
  const other = { hooks: { SessionStart: [{ matcher: 'startup', hooks: [{ type: 'command', command: 'echo oi' }] }], Stop: [] }, model: 'x' };
  const once = upsertClaudeHook(other, 'knowledge-mcp');
  const twice = upsertClaudeHook(once, 'knowledge-mcp');
  assert.equal(twice.hooks.SessionStart.length, 2);
  assert.equal(twice.model, 'x');
  assert.deepEqual(removeClaudeHook(twice), other);
});

test('hook do Cursor e mcp.json preservam o que já existe', () => {
  const hooks = upsertCursorHook(upsertCursorHook({ version: 1, hooks: { stop: [{ command: 'x' }] } }, 'k'), 'k');
  assert.deepEqual(hooks.hooks.sessionStart, [{ command: 'k context --hook cursor' }]);
  assert.deepEqual(hooks.hooks.stop, [{ command: 'x' }]);
  const mcp = upsertMcpServer({ mcpServers: { github: { url: 'u' } } }, 'knowledge-mcp');
  assert.deepEqual(Object.keys(mcp.mcpServers), ['github', 'knowledge-os']);
  const quoted = upsertMcpServer({}, '"C:\\Program Files\\py.exe" -m src.cli').mcpServers['knowledge-os'];
  assert.equal(quoted.command, 'C:\\Program Files\\py.exe');
  assert.deepEqual(quoted.args, ['-m', 'src.cli']);
});

test('sem knowledge-mcp instalado, avisa e não registra hook', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const out = execFileSync(process.execPath, [CLI, 'install', '--claude'], {
    env: { ...process.env, PLUMB_HOME: home, PLUMB_BRAIN_CMD: 'comando-que-nao-existe-plumb' }, encoding: 'utf8',
  });
  assert.match(out, /knowledge-mcp` não encontrado/);
  assert.ok(!existsSync(join(home, '.claude', 'settings.json')));
});

test('install --project grava .mcp.json e o hook no projeto', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const proj = join(home, 'app');
  mkdirSync(proj);
  execFileSync(process.execPath, [CLI, 'install', '--both', '--project'], { cwd: proj, env: { ...process.env, ...fakes(home) }, encoding: 'utf8' });
  assert.ok(JSON.parse(readFileSync(join(proj, '.mcp.json'), 'utf8')).mcpServers['knowledge-os']);
  assert.ok(JSON.parse(readFileSync(join(proj, '.claude', 'settings.json'), 'utf8')).hooks.SessionStart);
  assert.ok(JSON.parse(readFileSync(join(proj, '.cursor', 'hooks.json'), 'utf8')).hooks.sessionStart);
  assert.ok(!existsSync(join(home, 'claude-calls.txt')), 'no projeto não usa claude mcp add');
});
