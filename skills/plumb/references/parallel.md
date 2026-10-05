# Lotes em paralelo

Só com 3 lotes ou mais independentes (arquivos disjuntos), commits ligados e
isolamento em worktree disponível — sem worktree, em sequência: dois agentes
no mesmo diretório se atropelam. Só com o "sim" do usuário, oferecido no plano.

1. Commite o estado atual — as worktrees partem do HEAD.
2. Despache os implementadores do grupo de uma vez, cada um com isolamento em
   worktree e a instrução de commitar na própria branch.
3. Com todos de volta, integre um por vez, na ordem dos lotes
   (`git merge --no-ff <branch>`, ou cherry-pick se o projeto não usa merge
   commits), rodando o comando de verificação do lote depois de cada integração.
4. Conflito trivial (imports, listas): resolva e rode os testes. Conflito em
   lógica: pare e leve ao usuário. Lotes independentes não deveriam conflitar —
   anote `retrabalho` na Retro.
5. Lote que voltou `travado` ou `escopo`: integre os outros e trate esse depois.
6. Remova as worktrees e branches integradas (`git worktree remove`, `git branch -d`).
