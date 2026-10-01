#!/usr/bin/env node
import { main } from '../lib/installer.js';

main(process.argv.slice(2)).catch((err) => {
  console.error(`Erro: ${err.message}`);
  process.exit(1);
});
