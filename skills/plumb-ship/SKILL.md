---
name: plumb-ship
description: Fecha a entrega — faz uma rodada final de dúvidas/ajustes até o usuário dizer que está 100%, depois leva o trabalho para fora da máquina (push da branch, abrir PR, merge local na base, ou deixar) e limpa o worktree, nada sem o "sim". No merge a spec some (squash) e o card do gestor é atualizado. Use quando o usuário diz "entrega", "abre o PR", "faz o merge", "pode subir". / Closes delivery: a final round until the user says it's 100%, then push/PR/merge + worktree cleanup with the "yes"; squashes the spec on merge and updates the tracker card.
---

# Plumb — ship (fechar a entrega)

**No idioma do usuário.** Você **fecha a mudança**: confirma que está 100%, leva o trabalho para
fora da máquina do jeito certo e deixa a casa limpa. **Nada sai da máquina sem o "sim".**

Leia `playbook.md` (a rodada final, push vs PR vs merge, o squash da spec, o card, a limpeza) uma
vez. Worktree em `../plumb/references/worktrees.md`; gestor de tarefas em
`../plumb/references/task-manager.md`.

## Princípios

- **Prova antes de fechar.** Só chegue aqui com `qa` e `review` feitos; o que falhou volta ao
  `plumb-code`, não ao ship.
- **O usuário dá o 100%.** A rodada final se repete até ele dizer que está pronto; havendo ajuste,
  corrige, prova de novo e pergunta outra vez.
- **Nada sai sem o "sim".** Push, PR, merge e limpeza do worktree só com a escolha explícita (pela
  ferramenta de perguntas, recomendação primeiro).

## Procedimento

1. **O que preciso saber (explorar → perguntar na dúvida).** Antes de fechar, **explore**:
   `.plumb/knowledge/preferences/ship.md` (projeto **e** global) e as convenções de PR/commit do
   repo (template de PR, histórico de mensagens de commit, estratégia de merge). O que isso já
   responde **não vira pergunta**. **Na dúvida, sempre pergunte** (ferramenta de perguntas,
   recomendação primeiro) — não adivinhe formato de PR, convenção de commit ou estratégia de merge.
   **Após CADA resposta, passe pelo `plumb-learn`** para gravar o que durar (projeto → convenção do
   repo/time; global → preferência pessoal de entrega). **Siga a preferência/fato salvo**
   (precedência **projeto → global → playbook**). O mecanismo completo em
   `../plumb/references/preferences.md`; o que costuma ser pergunta, em `playbook.md` §"O que preciso
   saber". (A pergunta de push/PR/merge/deixar da entrega continua existindo normalmente, no passo 4.)
2. **Rodada final.** Pergunte (ferramenta de perguntas, **"Está 100%"** primeiro) se há dúvida ou
   ajuste. Se houver: corrija, **prove de novo** (volta ao `plumb-code`/`qa`) e **pergunte outra
   vez**. Repita até o 100%.
3. **Traga a base** se ela avançou (`git merge <base>` no worktree) e rode os testes de novo —
   `worktrees.md` §4.
4. **Escolha de saída, numa chamada só** (recomendação primeiro): **push da branch** · **abrir PR**
   (título + corpo) · **merge local na base** · **deixar como está**. Veja o playbook para quando
   recomendar cada um.
5. **Execute o escolhido.** No **merge**, remova/squash a spec `.plumb/work/<id>.md` para **não
   poluir a main**. Com um **gestor de tarefas** conectado (`task-manager.md`), **atualize o card**
   (status/resumo/evidência, link do commit ou PR).
6. **Limpe o worktree** só com o "sim" (na mesma chamada): `worktrees.md` §6. Branch não integrada
   ou mudança não commitada → diga e não force.

## Trilha direta / sem git

Score 1–2 ou projeto sem git: **sem rodada final** — diga **onde o trabalho ficou** (arquivos,
árvore principal) e termine.

## Override (dev/empresa)

Template de PR/commit e **definição de pronto** do `.plumb/knowledge/` **vencem** o default
(precedência projeto → global → default). Use o formato deles.

## Saída

Reporte o que saiu da máquina (branch empurrada, PR com link, ou merge feito), o estado do worktree
e do card. É o **último passo do fluxo**. No fecho da sessão, se fizer sentido, sugira
`plumb-reflect`.
