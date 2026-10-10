# Lotes em paralelo

Só com 3 lotes ou mais independentes (arquivos disjuntos), commits ligados e
a mudança já rodando no worktree dela (`worktrees.md`) — sem git, em sequência:
dois agentes no mesmo diretório se atropelam. Só com o "sim" do usuário,
perguntado pela ferramenta de perguntas (recomendação primeiro), no momento da
spec.

Estes são worktrees **filhos**, do mesmo repositório: partem do HEAD do worktree
da mudança e voltam para a branch dela. Não confunda com o worktree da mudança em
si, que vive em `.claude/worktrees/<id>`.

1. Commite o estado atual no worktree da mudança — os filhos partem do HEAD.
2. Despache os implementadores do grupo de uma vez, cada um num worktree filho
   (`<raiz do repositório>/.claude/worktrees/<id>-<lote>`, branch `<branch>-<lote>`;
   a raiz é a da árvore principal, `dirname "$(git rev-parse --git-common-dir)"`, e
   o caminho **não** fica aninhado dentro do worktree da mudança, senão o
   `git worktree remove` do pai não o alcança), com o caminho
   absoluto dele no `<contexto>` e a instrução de trabalhar só ali e commitar na
   própria branch.
3. Com todos de volta, integre um por vez **na branch da mudança**, dentro do
   worktree dela, na ordem dos lotes (`git merge --no-ff <branch-do-lote>`, ou
   cherry-pick se o projeto não usa merge commits), rodando o comando de
   verificação do lote depois de cada integração.
4. Conflito trivial (imports, listas): resolva e rode os testes. Conflito em
   lógica: pare e leve ao usuário. Lotes independentes não deveriam conflitar —
   anote `retrabalho` na Retro.
5. Lote que voltou `travado` ou `escopo`: integre os outros e trate esse depois.
6. Remova os worktrees filhos e as branches integradas (`git worktree remove`,
   `git branch -d`). O worktree da mudança só sai na entrega, com o "sim".
