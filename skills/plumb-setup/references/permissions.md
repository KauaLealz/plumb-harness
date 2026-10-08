# Permissões do projeto

Lido pelo orquestrador no `/plumb-setup`, ao gravar as permissões.

**Por que a lista `allow` tem que ser larga.** `ask` não protege nada quando a
sessão roda em `bypassPermissions`/skip (o Claude Code ignora `ask` nesse modo,
igual a `allow`) — só `deny` segura nos dois modos. E no modo normal, qualquer
ferramenta ou comando que não casa com `allow` cai em aprovação manual: uma
lista curta (só teste e lint) transforma toda edição de arquivo, todo comando
de build/dev/git não listado, e toda outra ferramenta do cérebro numa aprovação
a mais. O objetivo aqui não é listar "o que o Plumb usa hoje" — é cobrir tudo
que o trabalho do dia a dia precisa, deixando só o que é genuinamente arriscado
em `ask`/`deny`.

Claude Code — `.claude/settings.json`:
- `allow`: `Edit`, `Write`, `Read` (exceto os arquivos negados abaixo),
  `Glob`, `Grep`; todos os comandos de teste, lint, typecheck, build, subir
  localmente e cobertura encontrados na exploração (não só teste e lint —
  ex.: `Bash(npm test *)`, `Bash(npm run lint *)`, `Bash(npm run build *)`,
  `Bash(npm run typecheck *)`, `Bash(npm run dev *)`); git local e não
  destrutivo (`Bash(git status *)`, `Bash(git diff *)`, `Bash(git log *)`,
  `Bash(git add *)`, `Bash(git commit *)`, `Bash(git branch *)`,
  `Bash(git checkout *)`, `Bash(git merge *)`, `Bash(git worktree *)`); e
  **todas** as ferramentas do cérebro que o Plumb usa no dia a dia, não um
  subconjunto (`mcp__knowledge-os__item_search`, `item_get`, `item_graph`,
  `item_save`, `item_feedback`, `relation_create`, `relation_delete`, `tag_list`,
  `tag_create`, `workspace_list`, `project_list`, `subject_list`,
  `connection_list`, `repo`, `health_check`, todas com o prefixo
  `mcp__knowledge-os__`). Apagar item, tag, workspace, project ou subject e
  criar conexão ficam de fora: pedem confirmação.
- `ask`: `Bash(git push *)`, `Bash(gh pr create *)`,
  `Bash(git reset --hard *)`, `Bash(rm -rf *)` e os comandos de deploy ou
  de infraestrutura que o projeto usa (`Bash(vercel --prod *)`,
  `Bash(terraform apply *)`, `Bash(kubectl delete *)`). Sob skip/bypass,
  estes não travam nada — são a confirmação do modo normal, não a
  segurança real.
- `deny`: `Bash(git push --force *)`, `Bash(git push -f *)` e um
  `Read(./<arquivo>)` para cada arquivo de ambiente com valores reais
  (`.env`, `.env.local`, `.env.production`…), cada um pelo nome — um
  curinga como `.env.*` bloquearia também o `.env.example`. Isto é o único
  grupo que vale em qualquer modo — o que precisa ser impossível, não só
  pedir confirmação, vai aqui.

Cursor — `.cursor/cli.json` (não existe `ask`: o que não está em `allow`
pede aprovação — por isso `allow` aqui precisa ser pelo menos tão largo
quanto o do Claude Code acima, não só teste e lint; **sem a chave
`version`** — o arquivo de projeto só aceita `permissions`, e o
`cursor-agent` se recusa a iniciar com qualquer outra chave):
```json
{ "permissions": {
    "allow": ["Shell(npm test)", "Shell(npm run lint)", "Shell(npm run build)",
      "Shell(npm run typecheck)", "Shell(git status)", "Shell(git diff)",
      "Shell(git log)", "Shell(git add)", "Shell(git commit)",
      "Shell(git branch)", "Shell(git checkout)", "Shell(git merge)",
      "Shell(git worktree)"],
    "deny":  ["Shell(git push --force)", "Shell(git push -f)", "Read(.env)", "Read(.env.local)"] } }
```
e `.cursor/permissions.json`:
```json
{ "autoRun": { "block_instructions": [
    "Não rode git push, gh pr create, git reset --hard, rm -rf nem comandos de deploy sem o usuário ter confirmado no chat." ] } }
```

Projeto com as duas ferramentas: gere os dois conjuntos. `CLAUDE.md` com
`@AGENTS.md` só para o Claude Code; o Cursor lê o `AGENTS.md` direto.
