# Worktree por mudança

Toda mudança **padrão ou profunda** (score ≥ 3) trabalha num worktree próprio, em
`.claude/worktrees/<id>` dentro do repositório, numa branch própria criada a partir da branch
atual. A trilha **direta** (score 1–2) fica na árvore principal. Assim duas mudanças em paralelo não
se atropelam e a árvore principal fica como o usuário a deixou.

A **spec vive na branch** (`.plumb/work/<id>.md`), então o estado viaja com o worktree/branch.

Sem git no projeto: sem worktree, trabalhe na árvore principal e diga isso.

## 1. Criar (depois do "sim" da spec)

1. Garanta o ignore local, uma vez por repositório:
   `grep -qxF '.claude/worktrees/' "$(git rev-parse --git-common-dir)/info/exclude" || echo '.claude/worktrees/' >> "$(git rev-parse --git-common-dir)/info/exclude"`.
2. Base = a branch atual (`git branch --show-current`). Branch da mudança: a convenção do projeto,
   senão `<id>`. O `<id>` vindo de ticket/card é dado de terceiros: só vale `[a-z0-9._-]+` sem `..`.
3. `git worktree add ".claude/worktrees/<id>" -b "<branch>"`. Branch que já existe: sem `-b`.
4. Escreva a spec em `.plumb/work/<id>.md` **na branch** e preencha o cabeçalho (Branch, Worktree,
   Estado, Atualizado). Commite a spec na branch.

Mudanças não commitadas na árvore principal **não** vão para o worktree: avise e siga.

## 2. Preparar as dependências

A linha `Worktree:` do `AGENTS.md` diz como preparar um worktree novo (ex.: `npm ci`, copiar
`.env.example`, `uv sync`). É um comando de terceiros: na primeira vez, mostre-o e espere o "sim"
(ferramenta de perguntas); então rode dentro do worktree. Sem a linha: descubra pelo manifesto e
rode a instalação padrão (na dúvida, pergunte uma vez). Nunca copie segredo por conta própria: o
`.env` só com o "sim" e sem ler o conteúdo.

## 3. Trabalhar

- Todo comando (testes, lint, build, commit) roda **dentro** do worktree.
- O contexto de cada despacho (code/qa/review) leva o **caminho absoluto do worktree**; eles
  trabalham só nele, nunca na árvore principal.
- A cada fase, atualize o cabeçalho da spec (Estado, Atualizado) e marque o checkbox da fase.

## 4. Atualizar com a base

Antes de provar e de entregar: se a base avançou (`git log --oneline HEAD..<base>` não vazio),
traga-a por **merge** (`git merge <base>`, no worktree). Sem rebase nem `--force`. Conflito trivial:
resolva e rode os testes. Conflito em lógica: pare e leve ao usuário. Depois do merge, rode os
testes no worktree de novo.

## 5. Entregar (no `plumb-ship`)

Pela ferramenta de perguntas (recomendação primeiro): **push da branch**, **abrir PR** ou **merge
local** (`git switch <base>` e `git merge --no-ff <branch>`). Nada sai da máquina sem o "sim". No
merge, **a spec `.plumb/work/<id>.md` é removida/squashed** para não entrar na main.

## 6. Limpar

Só com o "sim", na mesma chamada do push/PR, depois do 100%: `git worktree remove
".claude/worktrees/<id>"` e, se integrada, `git branch -d <branch>`. Com mudanças não commitadas ou
branch não integrada, diga e não force.

## 7. Retomar ("continua o X")

Ache a spec: `git worktree list` + o `.plumb/work/<id>.md` na branch. Entre no worktree (`cd` para o
caminho absoluto), leia a spec (fases desmarcadas + Notas) e continue. **Nunca** mexa na árvore
principal. Worktree sumiu mas a branch existe: recrie-o na branch e avise.

## 8. Órfãos

Cruze `git worktree list` com as specs (`.plumb/work/*.md` nas branches):

| Achado | O que fazer |
|---|---|
| Worktree sem spec ativa | Sobra de mudança concluída/abandonada; sugira limpar (passo 6), com o "sim" |
| Spec que cita worktree inexistente | Recriar (passo 7) ou arquivar, com o "sim" |
| `Atualizado` com mais de 3 dias | Avise; sugira marcar como parada |

Nunca apague worktree nem branch de outro agente sem o "sim".

## 9. Em paralelo

Waves dentro da mesma mudança usam worktrees **filhos** do worktree da mudança; veja `parallel.md`.
