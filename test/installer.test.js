import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { removeBlock, toCursorAgent, upsertBlock } from '../lib/installer.js';

const CLI = fileURLToPath(new URL('../bin/cli.js', import.meta.url));
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
  assert.equal(toCursorAgent(src), '---\nname: a\nreadonly: true\nmodel: inherit\n---\nbody\n');
});

test('install --both global: skills, agentes e instrução; idempotente; uninstall desfaz', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  mkdirSync(join(home, '.claude'));
  writeFileSync(join(home, '.claude', 'CLAUDE.md'), '# Minhas regras\n');
  const run = (...args) =>
    execFileSync(process.execPath, [CLI, ...args], { env: { ...process.env, PLUMB_HOME: home }, encoding: 'utf8' });

  run('install', '--both');
  run('install', '--both');
  assert.ok(existsSync(join(home, '.claude', 'skills', 'plumb', 'SKILL.md')));
  assert.ok(existsSync(join(home, '.claude', 'skills', 'plumb-setup', 'references', 'catalog.md')));
  assert.ok(!existsSync(join(home, '.cursor', 'skills')), 'com os dois, o Cursor lê .claude/skills');
  assert.match(readFileSync(join(home, '.cursor', 'agents', 'plumb-explorer.md'), 'utf8'), /^model: inherit$/m);
  assert.match(readFileSync(join(home, '.claude', 'agents', 'plumb-explorer.md'), 'utf8'), /^model: sonnet$/m);
  const md = readFileSync(join(home, '.claude', 'CLAUDE.md'), 'utf8');
  assert.equal(md.match(/plumb:start/g).length, 1);
  assert.ok(md.startsWith('# Minhas regras'));
  assert.match(run('status'), /Claude Code\s+skills: v\d.*instrução global: sim/);

  run('uninstall', '--both');
  assert.ok(!existsSync(join(home, '.claude', 'skills', 'plumb')));
  assert.ok(!existsSync(join(home, '.cursor', 'agents', 'plumb-explorer.md')));
  assert.equal(readFileSync(join(home, '.claude', 'CLAUDE.md'), 'utf8'), '# Minhas regras\n');
});

test('install --cursor sozinho grava as skills em ~/.cursor/skills', () => {
  const home = mkdtempSync(join(tmpdir(), 'plumb-'));
  execFileSync(process.execPath, [CLI, 'install', '--cursor'], { env: { ...process.env, PLUMB_HOME: home }, encoding: 'utf8' });
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
  execFileSync(process.execPath, [CLI, 'install', '--claude'], { env: { ...process.env, PLUMB_HOME: home }, encoding: 'utf8' });
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