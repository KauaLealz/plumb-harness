import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  entryCommand, removeBlock, removeClaudeHook, removeCursorEntryHook, removeEntryHooks, toCursorAgent, upsertBlock,
  upsertClaudeHook, upsertCursorEntryHook, upsertCursorHook, upsertEntryHooks, upsertMcpServer,
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
  assert.ok(existsSync(join(home, '.claude', 'skills', 'plumb-grill', 'SKILL.md')), 'o /plumb-grill é instalado');
  assert.ok(!existsSync(join(home, '.cursor', 'skills')), 'com os dois, o Cursor lê .claude/skills');
  assert.match(readFileSync(join(home, '.cursor', 'agents', 'plumb-explorer.md'), 'utf8'), /^model: inherit$/m);
  // os agentes herdam o modelo da sessão; o tier por papel fica no corpo, não no frontmatter
  assert.match(readFileSync(join(home, '.claude', 'agents', 'plumb-explorer.md'), 'utf8'), /^model: inherit$/m);
  const md = readFileSync(join(home, '.claude', 'CLAUDE.md'), 'utf8');
  assert.equal(md.match(/plumb:start/g).length, 1);
  assert.ok(md.startsWith('# Minhas regras'));
  assert.match(run('status'), /Claude Code\s+skills: v\d.*instrução global: sim · hook de entrada: sim · hook do cérebro: sim/);

  const settings = JSON.parse(readFileSync(join(home, '.claude', 'settings.json'), 'utf8'));
  assert.equal(settings.hooks.SessionStart.length, 2, 'hooks do cérebro e de entrada, sem duplicar');
  assert.ok(settings.hooks.SessionStart.some((g) => /context --hook claude$/.test(g.hooks[0].command)));
  assert.equal(settings.hooks.UserPromptSubmit.length, 1);
  assert.match(settings.hooks.UserPromptSubmit[0].hooks[0].command, /^node ".*\/skills\/plumb\/hooks\/entry\.mjs" --claude-prompt$/);
  assert.match(settings.hooks.Stop[0].hooks[0].command, /--claude-stop$/);
  assert.ok(existsSync(join(home, '.claude', 'skills', 'plumb', 'hooks', 'entry.mjs')));
  const calls = readFileSync(join(home, 'claude-calls.txt'), 'utf8');
  assert.match(calls, /mcp add --scope user knowledge-os -e LOG_LEVEL=WARNING -- /);
  const cursorMcp = JSON.parse(readFileSync(join(home, '.cursor', 'mcp.json'), 'utf8'));
  assert.equal(cursorMcp.mcpServers['knowledge-os'].env.LOG_LEVEL, 'WARNING');
  const cursorHooks = JSON.parse(readFileSync(join(home, '.cursor', 'hooks.json'), 'utf8'));
  assert.equal(cursorHooks.hooks.sessionStart.length, 2, 'hook do cérebro e roteador de entrada');
  assert.ok(cursorHooks.hooks.sessionStart.some((h) => /entry\.mjs" --cursor-session$/.test(h.command)));
  assert.ok(!cursorHooks.hooks.beforeSubmitPrompt, 'o Cursor não injeta contexto por prompt');

  run('uninstall', '--both');
  assert.ok(!existsSync(join(home, '.claude', 'skills', 'plumb')));
  assert.ok(!existsSync(join(home, '.cursor', 'agents', 'plumb-explorer.md')));
  assert.equal(readFileSync(join(home, '.claude', 'CLAUDE.md'), 'utf8'), '# Minhas regras\n');
  const after = JSON.parse(readFileSync(join(home, '.claude', 'settings.json'), 'utf8'));
  assert.ok(!after.hooks, 'uninstall tira todos os hooks do Plumb');
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
  const hooks = JSON.parse(readFileSync(join(home, '.claude', 'settings.json'), 'utf8')).hooks;
  assert.ok(hooks.UserPromptSubmit, 'o hook de entrada não depende do cérebro');
  assert.ok(!(hooks.SessionStart || []).some((g) => /context --hook/.test(g.hooks[0].command)), 'sem hook do cérebro');
});

test('install --project grava .mcp.json e o hook no projeto', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const proj = join(home, 'app');
  mkdirSync(proj);
  execFileSync(process.execPath, [CLI, 'install', '--both', '--project'], { cwd: proj, env: { ...process.env, ...fakes(home) }, encoding: 'utf8' });
  assert.ok(JSON.parse(readFileSync(join(proj, '.mcp.json'), 'utf8')).mcpServers['knowledge-os']);
  assert.ok(JSON.parse(readFileSync(join(proj, '.claude', 'settings.json'), 'utf8')).hooks.SessionStart);
  assert.ok(JSON.parse(readFileSync(join(proj, '.cursor', 'hooks.json'), 'utf8')).hooks.sessionStart);
  // o arquivo do projeto é commitado: nenhum caminho da máquina de quem instalou
  const projSettings = readFileSync(join(proj, '.claude', 'settings.json'), 'utf8');
  assert.match(projSettings, /node \\"\$CLAUDE_PROJECT_DIR\/\.claude\/skills\/plumb\/hooks\/entry\.mjs\\" --claude-prompt/);
  assert.ok(!projSettings.includes(proj.replaceAll(String.fromCharCode(92), '/')) && !projSettings.includes(home.replaceAll(String.fromCharCode(92), '/')));
  const projCursor = readFileSync(join(proj, '.cursor', 'hooks.json'), 'utf8');
  assert.match(projCursor, /node \\"\.claude\/skills\/plumb\/hooks\/entry\.mjs\\" --cursor-session/);
  assert.ok(existsSync(join(proj, '.claude', 'skills', 'plumb', 'hooks', 'entry.mjs')));
  assert.ok(!existsSync(join(home, 'claude-calls.txt')), 'no projeto não usa claude mcp add');
});

test('install remove skills e agentes do Plumb que foram renomeados, e preserva homônimos de terceiros', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const skills = join(home, '.claude', 'skills');
  const agents = join(home, '.claude', 'agents');
  mkdirSync(join(skills, 'plumb-retro'), { recursive: true });
  writeFileSync(join(skills, 'plumb-retro', 'SKILL.md'), 'skill antiga\n');
  mkdirSync(agents, { recursive: true });
  writeFileSync(join(agents, 'plumb-curator.md'), 'Curador do Plumb — texto antigo\n');
  writeFileSync(join(agents, 'plumb-dreamer.md'), 'Dreamer do Plumb — texto antigo\n');
  // homônimo de terceiro: não é nosso, não some
  writeFileSync(join(agents, 'plumb-security.md'), 'agente de outra pessoa\n');

  execFileSync(process.execPath, [CLI, 'install', '--claude'],
    { env: { ...process.env, ...fakes(home) }, encoding: 'utf8' });

  assert.equal(existsSync(join(skills, 'plumb-retro')), false);
  assert.equal(existsSync(join(skills, 'plumb-dream')), true);
  assert.equal(existsSync(join(agents, 'plumb-curator.md')), false);
  assert.equal(existsSync(join(agents, 'plumb-dreamer.md')), false, 'o dreamer saiu: o orquestrador faz o fechamento');
  assert.equal(existsSync(join(agents, 'plumb-explorer.md')), true);
  assert.equal(readFileSync(join(agents, 'plumb-security.md'), 'utf8'), 'agente de outra pessoa\n');
});

test('hooks de entrada: não duplicam, preservam os de terceiros e saem limpos', () => {
  const BS = String.fromCharCode(92);
  const script = ['C:', 'Users', 'x', '.claude', 'skills', 'plumb', 'hooks', 'entry.mjs'].join(BS);
  const other = { hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo fim' }] }], PreToolUse: [] }, model: 'x' };
  const once = upsertEntryHooks(other, script);
  const twice = upsertEntryHooks(once, script);
  assert.equal(twice.hooks.Stop.length, 2);
  assert.equal(twice.hooks.UserPromptSubmit.length, 1);
  assert.equal(twice.hooks.SessionStart.length, 1);
  assert.equal(twice.hooks.UserPromptSubmit[0].hooks[0].command, 'node "C:/Users/x/.claude/skills/plumb/hooks/entry.mjs" --claude-prompt');
  assert.deepEqual(removeEntryHooks(twice), other);
  assert.equal(entryCommand('C:' + BS + 'a b' + BS + 'c.mjs', '--m'), 'node "C:/a b/c.mjs" --m');
  // caracteres especiais do bash dentro das aspas são escapados; o modo raw deixa a variável do projeto expandir
  assert.equal(entryCommand('/p/$(rm -rf x)/`y`/"z".mjs', '--m'), 'node "/p/\\$(rm -rf x)/\\`y\\`/\\"z\\".mjs" --m');
  assert.equal(entryCommand('$CLAUDE_PROJECT_DIR/.claude/skills/plumb/hooks/entry.mjs', '--m', { raw: true }),
    'node "$CLAUDE_PROJECT_DIR/.claude/skills/plumb/hooks/entry.mjs" --m');
  const cursor = upsertCursorEntryHook(upsertCursorEntryHook({ hooks: { stop: [{ command: 'x' }] } }, script), script);
  assert.equal(cursor.hooks.sessionStart.length, 1);
  assert.deepEqual(removeCursorEntryHook(cursor), { version: 1, hooks: { stop: [{ command: 'x' }] } });
});

test('uninstall com settings.json inválido para antes de apagar o script dos hooks', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const env = { ...process.env, ...fakes(home) };
  const run = (...args) => execFileSync(process.execPath, [CLI, ...args], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  run('install', '--claude');
  const entry = join(home, '.claude', 'skills', 'plumb', 'hooks', 'entry.mjs');
  assert.ok(existsSync(entry));
  writeFileSync(join(home, '.claude', 'settings.json'), '{ isto não é json');
  assert.throws(() => run('uninstall', '--claude'), /não é JSON válido/);
  assert.ok(existsSync(entry), 'o script continua lá: os hooks não ficam apontando para o vazio');
});

test('uninstall --claude depois de --both tira também o hook do Cursor que apontava para as skills do Claude Code', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  const env = { ...process.env, ...fakes(home) };
  const run = (...args) => execFileSync(process.execPath, [CLI, ...args], { env, encoding: 'utf8' });
  run('install', '--both');
  run('uninstall', '--claude');
  const cursorHooks = JSON.parse(readFileSync(join(home, '.cursor', 'hooks.json'), 'utf8'));
  assert.ok(!(cursorHooks.hooks?.sessionStart || []).some((h) => /entry\.mjs/.test(h.command)));
});

test('hooks de terceiros com nome parecido não são tocados', () => {
  const other = { hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'node "/x/my-plumb/hooks/entry.mjs" --foo' }] }] } };
  assert.deepEqual(removeEntryHooks(upsertEntryHooks(other, '/h/.claude/skills/plumb/hooks/entry.mjs')).hooks, other.hooks);
});
