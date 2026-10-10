# Worktree por mudança

Toda mudança **padrão ou profunda** trabalha num worktree próprio, em
`.claude/worktrees/<id>` dentro do repositório, numa branch própria criada a
partir da branch atual. A trilha **direta** fica na árvore principal. Assim duas
mudanças em paralelo não se atropelam e a árvore principal fica como o usuário a
deixou.

Sem git no projeto: sem worktree, trabalhe na árvore principal e diga isso.

## 1. Criar (depois do "sim" da spec)

1. Garanta o ignore local, uma vez por repositório:
   `grep -qxF '.claude/worktrees/' "$(git rev-parse --git-common-dir)/info/exclude" || echo '.claude/worktrees/' >> "$(git rev-parse --git-common-dir)/info/exclude"`.
   É o `.git/info/exclude`: local, não suja o `.gitignore` do time.
2. Base = a branch atual (`git branch --show-current`). Branch da mudança: a
   convenção do projeto, senão `<id>`.
3. `git worktree add .claude/worktrees/<id> -b <branch>` (a partir do HEAD da
   base). Branch que já existe: `git worktree add .claude/worktrees/<id> <branch>`.
4. Registre na spec: `Base`, `Branch`, `Worktree: .claude/worktrees/<id>`, tag
   `worktree`, e o `summary` com o caminho (padrão em `brain.md` §15).

Mudanças não commitadas na árvore principal **não** vão para o worktree: avise
se houver, e siga (o worktree parte do último commit).

## 2. Preparar as dependências

A linha `Worktree:` do `AGENTS.md` diz como preparar um worktree novo (ex.:
`npm ci`, copiar `.env.example`, `uv sync`). Rode-a dentro do worktree. Sem essa
linha: descubra pelo manifesto (`package.json`, `pyproject.toml`…), rode o que for
a instalação padrão do projeto e, se não tiver certeza, pergunte uma vez pela
ferramenta de perguntas (recomendando a instalação padrão) — e sugira registrar a
linha `Worktree:` no `AGENTS.md`. Nunca copie segredo para o worktree; use o que
o `AGENTS.md` indicar.

## 3. Trabalhar

- Todo comando (testes, lint, build, commit) roda **dentro** do worktree.
  O contexto de cada despacho de implementador, testador e revisor leva o
  **caminho absoluto do worktree**; eles trabalham só nele e nunca na árvore
  principal.
- Commits na branch da mudança, como o projeto manda. Não toque na árvore
  principal nem na branch da base.
- A cada fase, atualize na spec o resumo, a tag de estado e `Atualizado`.

## 4. Atualizar com a base

Antes de provar e antes de entregar: se a base avançou
(`git log --oneline HEAD..<base>` não vazio), traga-a para a branch da mudança por
**merge** (`git merge <base>`, dentro do worktree). Sem reescrever histórico: nada
de rebase nem de `--force`. Conflito trivial (imports, listas): resolva e rode os
testes. Conflito em lógica: pare e leve ao usuário pela ferramenta de perguntas,
com as opções e a recomendação. Depois do merge, rode os testes **no worktree**
de novo; só então prove e entregue.

## 5. Entregar

A pergunta da entrega (pela ferramenta de perguntas, recomendação primeiro):
**push da branch**, **abrir PR** ou **merge local na base** (`git switch <base>`
na árvore principal e `git merge --no-ff <branch>`, que só roda com esse "sim").
Nada sai da máquina sem ele. Mudanças não commitadas na árvore principal que
atrapalhem o merge local: avise, não as descarte.

## 6. Limpar

Só com o "sim" do usuário, perguntado depois da entrega (pela ferramenta de
perguntas; recomendado: limpar quando a branch foi integrada ou enviada):
`git worktree remove .claude/worktrees/<id>` e, se integrada,
`git branch -d <branch>`. Com mudanças não commitadas ou branch não integrada,
diga e não force. Ao limpar, tire a tag `worktree` e o caminho da spec (já
`done`).

## 7. Retomar

"Continua de onde paramos" com spec ativa que tem `Worktree`: entre no worktree
(`cd` para o caminho absoluto) e continue de lá; confira `git worktree list` e
`git status`. **Nunca** mexa na árvore principal. Assuma o campo `Agente` da spec
(você + a sessão atual) e, se era de outro agente, avise uma linha: `Retomando o
que estava com outro agente (sessão X)`. Worktree sumiu mas a spec o cita:
recrie-o na branch (passo 1, branch existente) e avise.

## 8. Órfãos

Cruze `git worktree list` com as specs ativas (`item_search(types=["spec"],
status=["active","draft"])`):

| Achado | O que dizer e fazer |
|---|---|
| Worktree em `.claude/worktrees/` sem spec ativa | Pode ser sobra de uma mudança concluída ou abandonada; sugira limpar (passo 6), com o "sim" |
| Spec ativa que cita `Worktree` que não existe | Recriar (passo 7) ou arquivar a spec, com o "sim" |
| Spec ativa de padrão ou profunda sem `Worktree` | Mudança do fluxo antigo; só avise |
| `Atualizado` com mais de 3 dias | Sugira a tag `parada` no lugar de `em-andamento` (com o "sim") |

Nunca apague worktree nem branch de outro agente sem o "sim" do usuário.

## 9. Em paralelo

Lotes em paralelo dentro da mesma mudança usam worktrees **filhos** do worktree
da mudança; veja `parallel.md`.
