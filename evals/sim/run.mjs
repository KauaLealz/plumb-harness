#!/usr/bin/env node
// Conduz um agente real (`claude -p`) turno a turno, como um usuário: cria um sandbox com o fixture, manda uma mensagem
// por vez (retomando a sessão), mostra a resposta e guarda tudo para análise. Sem dependências.
//
//   node evals/sim/run.mjs new <nome> [--fixture <pasta>] [--real-brain]
//   node evals/sim/run.mjs turn <nome> "<mensagem>"        (ou @arquivo.txt para ler a mensagem de um arquivo)
//   node evals/sim/run.mjs log <nome> [flags do extract.mjs]   transcript compacto da sessão
//   node evals/sim/run.mjs status <nome>                   sessão, turnos e custo acumulado
//   node evals/sim/run.mjs rm <nome>
//
// Isolamento: por padrão o cérebro (Knowledge OS) do agente aponta para <sandbox>/.brain-home (KNOWLEDGE_OS_HOME), então
// nada toca em ~/.knowledge-os. `--real-brain` desliga isso. Variáveis: PLUMB_SIM_DIR (onde ficam os sandboxes),
// PLUMB_SIM_CLAUDE (comando do claude, para testes), PLUMB_SIM_TIMEOUT_MIN (padrão 15), PLUMB_SIM_MODEL (opcional),
// PLUMB_SIM_ARGS (JSON com flags extras do claude, p.ex. ["--setting-sources","project","--strict-mcp-config","--mcp-config","<arquivo>"]
// para testar uma versão do Plumb e do servidor sem tocar no que está instalado em ~/.claude).
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = process.env.PLUMB_SIM_DIR || join(ROOT, '..', '.ksq-sim');
const CLAUDE = process.env.PLUMB_SIM_CLAUDE || 'claude';
const TIMEOUT_MS = Number(process.env.PLUMB_SIM_TIMEOUT_MIN || 15) * 60_000;

const dirOf = (name) => join(BASE, name);
const stateFile = (name) => join(dirOf(name), '.sim-state.json');
const slug = (cwd) => cwd.replace(/[^A-Za-z0-9]/g, '-');

function load(name) {
  if (!existsSync(stateFile(name))) throw new Error(`sandbox "${name}" não existe: rode "new ${name}"`);
  return JSON.parse(readFileSync(stateFile(name), 'utf8'));
}
const save = (name, state) => writeFileSync(stateFile(name), JSON.stringify(state, null, 2));

function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=sim', '-c', 'user.email=sim@example.com', ...args], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr || r.stdout}`);
}

function create(name, opts) {
  const dir = dirOf(name);
  if (existsSync(dir)) throw new Error(`${dir} já existe: use "rm ${name}" antes`);
  mkdirSync(dir, { recursive: true });
  cpSync(resolve(opts.fixture || join(ROOT, 'evals', 'fixture')), dir, { recursive: true });
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'fixture');
  const brainHome = opts.realBrain ? null : join(dir, '.brain-home');
  if (brainHome) mkdirSync(brainHome, { recursive: true });
  save(name, { name, dir, brainHome, session: null, turns: [], costUsd: 0 });
  console.log(`sandbox ${dir}\ncérebro: ${brainHome ?? 'REAL (~/.knowledge-os)'}`);
}

export function readMessage(arg) {
  if (arg.startsWith('@')) return readFileSync(arg.slice(1), 'utf8').trim();
  return arg;
}

function turn(name, message) {
  const st = load(name);
  const args = ['-p', '--permission-mode', 'bypassPermissions', '--output-format', 'json'];
  if (process.env.PLUMB_SIM_MODEL) args.push('--model', process.env.PLUMB_SIM_MODEL);
  if (process.env.PLUMB_SIM_ARGS) args.push(...JSON.parse(process.env.PLUMB_SIM_ARGS));
  if (st.session) args.push('--resume', st.session);
  const env = { ...process.env };
  if (st.brainHome) env.KNOWLEDGE_OS_HOME = st.brainHome;
  const started = Date.now();
  // A mensagem vai pelo stdin: aspas e quebras de linha não passam por shell nenhum.
  const r = spawnSync(CLAUDE, args, { cwd: st.dir, env, input: message, encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024, shell: process.platform === 'win32' });
  if (r.error) throw new Error(`claude não rodou: ${r.error.message}`);
  let out;
  try {
    out = JSON.parse(r.stdout);
  } catch {
    throw new Error(`saída inesperada (status ${r.status}): ${(r.stdout || r.stderr || '').slice(0, 400)}`);
  }
  const n = st.turns.length + 1;
  mkdirSync(join(dirOf(name), '.sim-turns'), { recursive: true });
  writeFileSync(join(dirOf(name), '.sim-turns', `${String(n).padStart(2, '0')}.json`), JSON.stringify({ message, out }, null, 2));
  st.session = out.session_id || st.session;
  st.costUsd += out.total_cost_usd || 0;
  st.turns.push({ n, message: message.slice(0, 120), isError: !!out.is_error, costUsd: out.total_cost_usd || 0, seconds: Math.round((Date.now() - started) / 1000) });
  save(name, st);
  console.log(`── turno ${n} · ${out.is_error ? 'ERRO' : 'ok'} · ${out.num_turns} chamadas · ${Math.round((out.duration_ms || 0) / 1000)} s · US$ ${(out.total_cost_usd || 0).toFixed(2)} (acumulado US$ ${st.costUsd.toFixed(2)})`);
  console.log(out.result ?? '(sem resultado)');
  if (out.is_error) process.exitCode = 1;
}

function log(name, extra) {
  const st = load(name);
  if (!st.session) throw new Error('ainda não há sessão');
  const file = join(homedir(), '.claude', 'projects', slug(st.dir), `${st.session}.jsonl`);
  if (!existsSync(file)) throw new Error(`transcript não encontrado: ${file}`);
  const r = spawnSync(process.execPath, [join(ROOT, 'skills', 'plumb-dream', 'scripts', 'extract.mjs'), file, ...extra], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
}

function status(name) {
  const st = load(name);
  console.log(`${name}: sessão ${st.session ?? '-'} · ${st.turns.length} turnos · US$ ${st.costUsd.toFixed(2)}`);
  for (const t of st.turns) console.log(`  ${t.n}. ${t.isError ? 'ERRO ' : ''}${t.seconds}s US$ ${t.costUsd.toFixed(2)} — ${t.message.replace(/\s+/g, ' ')}`);
}

function main(argv) {
  const [cmd, name, ...rest] = argv;
  try {
    if (cmd === 'new' && name) {
      const opts = { realBrain: rest.includes('--real-brain') };
      const i = rest.indexOf('--fixture');
      if (i >= 0) opts.fixture = rest[i + 1];
      return create(name, opts);
    }
    if (cmd === 'turn' && name && rest.length) return turn(name, readMessage(rest.join(' ')));
    if (cmd === 'log' && name) return log(name, rest);
    if (cmd === 'status' && name) return status(name);
    if (cmd === 'rm' && name) return rmSync(dirOf(name), { recursive: true, force: true });
    if (cmd === 'list') return console.log(existsSync(BASE) ? readdirSync(BASE).join('\n') : '(nenhum)');
    console.log('uso: run.mjs new|turn|log|status|rm <nome> ...   (veja o cabeçalho do arquivo)');
    process.exitCode = 2;
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
