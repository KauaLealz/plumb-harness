// Roda os testes de test/ sem depender de glob do shell (o `node --test test/*.test.js` não expande no cmd do Windows,
// e `node --test test/` não resolve diretório a partir do Node 23). O fixture de evals/ fica de fora de propósito.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(join(root, 'test'))
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => join('test', f));
const r = spawnSync(process.execPath, ['--test', ...files], { cwd: root, stdio: 'inherit' });
process.exit(r.status ?? 1);
