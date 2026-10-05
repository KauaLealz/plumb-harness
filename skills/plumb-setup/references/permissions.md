# Permissões do projeto

Lido pelo curador nos modos estruturação, migração e fundação (o `/plumb-setup` passa o caminho no prompt).

Claude Code — `.claude/settings.json`:
- `allow`: os comandos de teste e lint encontrados (ex.: `Bash(npm test *)`)
  e as ferramentas do cérebro usadas em toda mudança
  (`mcp__knowledge-os__context_get`, `mcp__knowledge-os__item_search`,
  `mcp__knowledge-os__item_get`, `mcp__knowledge-os__item_save`).
- `ask`: `Bash(git push *)`, `Bash(gh pr create *)`,
  `Bash(git reset --hard *)`, `Bash(rm -rf *)` e os comandos de deploy ou
  de infraestrutura que o projeto usa (`Bash(vercel --prod *)`,
  `Bash(terraform apply *)`, `Bash(kubectl delete *)`).
- `deny`: `Bash(git push --force *)`, `Bash(git push -f *)` e um
  `Read(./<arquivo>)` para cada arquivo de ambiente com valores reais
  (`.env`, `.env.local`, `.env.production`…), cada um pelo nome — um
  curinga como `.env.*` bloquearia também o `.env.example`.

Cursor — `.cursor/cli.json` (não existe `ask`: o que não está em `allow`
pede aprovação; **sem a chave `version`** — o arquivo de projeto só aceita
`permissions`, e o `cursor-agent` se recusa a iniciar com qualquer outra
chave):
```json
{ "permissions": {
    "allow": ["Shell(npm test)", "Shell(npm run lint)"],
    "deny":  ["Shell(git push --force)", "Shell(git push -f)", "Read(.env)", "Read(.env.local)"] } }
```
e `.cursor/permissions.json`:
```json
{ "autoRun": { "block_instructions": [
    "Não rode git push, gh pr create, git reset --hard, rm -rf nem comandos de deploy sem o usuário ter confirmado no chat." ] } }
```

Projeto com as duas ferramentas: gere os dois conjuntos. `CLAUDE.md` com
`@AGENTS.md` só para o Claude Code; o Cursor lê o `AGENTS.md` direto.
