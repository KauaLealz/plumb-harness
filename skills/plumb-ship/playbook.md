# Playbook do ship — como entregar bem

A expertise do `plumb-ship`: a rodada final, o canal de saída certo, o squash da spec, o card e a
limpeza. É o que o `ship` lê para fechar sem susto.

## O que preciso saber (1ª vez)

Para entregar do jeito do dev/time, a `ship` **explora** antes (`.plumb/knowledge/preferences/ship.md`
projeto + global, template de PR e histórico de commits do repo) e, **na dúvida, pergunta** — cada
resposta passa pelo `plumb-learn` e vira preferência, para não reinterrogar na próxima. O mecanismo
geral em `../plumb/references/preferences.md`. As dimensões:

| Dimensão | O que descobrir | Tende a ser |
|---|---|---|
| **Saída padrão** | push da branch vs abrir PR vs merge local vs deixar — qual recomendar por default | **projeto** (fluxo do time: tem revisão de PR? solo?) |
| **Título/corpo do PR** | formato do título (prefixo, idioma) e o que vai no corpo (objetivo, evidência, link do card, template do repo) | **projeto** (template/convenção do repo) |
| **Mensagem de commit** | convenção (Conventional Commits, idioma, escopo, trailer) | **projeto** (convenção do repo), com toque **global** se o dev tem estilo próprio |
| **Estratégia de merge** | squash vs `--no-ff` vs rebase ao integrar na base | **projeto** (política do repo) |
| **Comentário no card** | o que entra (resumo em resultado + evidência do `qa` + link do commit/PR), tom e idioma | **projeto** (o que o time espera no card) |

Precedência ao seguir o que está salvo: **projeto → global → o default deste playbook**.

## A rodada final (até o 100%)

O fecho é uma **conversa curta**, não um despacho. Você já provou (`qa`) e revisou (`review`); agora
confirma com o usuário que **nada ficou de fora**.

- Pergunte pela ferramenta de perguntas com **"Está 100%"** como primeira opção. Ofereça também
  "tenho um ajuste" e "tenho uma dúvida".
- **Dúvida** → responda (sem abrir mudança) e **pergunte de novo**.
- **Ajuste** → trate como mudança pequena: volta ao `plumb-code`, **prova de novo** no nível certo
  (`qa`), atualiza a evidência na spec, e **pergunta outra vez**. Ajuste que muda o escopo combinado
  é replanejamento (volta ao grill), não um remendo no ship.
- **Repita** quantas rodadas forem precisas. Só passe da saída depois do 100% explícito. Não
  antecipe push/PR/merge "para adiantar".

## O que sai da máquina — push vs PR vs merge local vs deixar

Uma escolha só, recomendação primeiro. Como escolher o default a recomendar:

| Situação | Recomende | Por quê |
|---|---|---|
| Time com revisão de PR / fluxo no gestor | **Abrir PR** | o merge é decisão de outra pessoa; o PR carrega título + corpo + evidência |
| Trabalho solo, base é a de trabalho (não a de produção) | **Merge local** na base | fecha o ciclo sem cerimônia de PR |
| Fim de dia / handoff / outra máquina vai continuar | **Push da branch** | salva e viaja (a spec vai junto) sem decidir o merge ainda |
| Ainda em dúvida, ou o usuário só quer revisar localmente | **Deixar como está** | nada irreversível; decide depois |

- **PR:** título curto no padrão do projeto; corpo = objetivo + resultados provados + evidência +
  link do card. Se há template de PR no repo ou no `.plumb/knowledge/`, siga-o (override vence).
- **Merge local:** `git switch <base>` e `git merge --no-ff <branch>` (`worktrees.md` §5). Antes,
  garanta que a base foi trazida e os testes passaram no worktree.
- **Push:** empurra a branch; a spec `.plumb/work/<id>.md` vai junto e serve de handoff.
- Nunca `--force`, nunca push/merge sem o "sim".

## O merge que remove a spec

A spec é um artefato **de trabalho**, não da main. No **merge local** (ou no squash do PR), o
`.plumb/work/<id>.md` é **removido/squashed** antes de entrar na base — ela viaja só enquanto a
branch vive (handoff, revisão no PR). Faça o commit da remoção fazer parte do próprio merge/squash,
para a main não guardar nem o arquivo nem o commit que o apaga. A **evidência que importa** já está
no card e/ou no corpo do PR; a spec não precisa sobreviver.

## O comentário no card

Com um gestor conectado (`task-manager.md`), o card é a fonte do **quê** e do **status**; o ship
fecha o laço:

- **Status** → pronto/concluído (num lugar só — não duplique no cérebro).
- **Comentário** com o resumo em linguagem de resultado + a **evidência** (do `qa`) + o **link** do
  commit ou PR.
- Sem gestor conectado, isso vive só na spec enquanto ela existe; depois do merge, no histórico do
  commit/PR.

## A limpeza do worktree

Só **depois do 100%** e só com o "sim", na **mesma chamada** da escolha de saída (`worktrees.md`
§6):

- `git worktree remove ".claude/worktrees/<id>"` e, se a branch já foi integrada, `git branch -d
  <branch>`.
- **Push** ou **deixar** → normalmente **mantenha** o worktree (o trabalho ainda vai continuar);
  pergunte antes de remover.
- Mudança não commitada, ou branch não integrada → **diga e não force**. Melhor um worktree a mais
  do que trabalho perdido.

## Sem git / trilha direta

Score 1–2 ou projeto sem git: **não há rodada final nem canal de saída**. O trabalho já está na
árvore principal; diga **onde ficou** (arquivos tocados, como rodar) e encerre. O `learn` ainda
considera o que durar.

## Pegadinhas

- Não feche com teste vermelho ou review com bloqueador em aberto — isso é loop com `plumb-code`,
  não ship.
- Não faça PR e merge local "para garantir": é uma escolha só.
- Não apague worktree/branch de **outro** agente sem o "sim" (`worktrees.md` §8).
- Depois de fechar a sessão (não a mudança), se houve aprendizado ou algo que mereça skill nova,
  `plumb-reflect` é o lugar — o ship não faz retro.
