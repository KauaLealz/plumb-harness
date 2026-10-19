---
name: plumb-review
description: Revisa ou audita código de OUTRA pessoa (um PR, uma branch, um diff que não é seu) contra as convenções do projeto e o segundo cérebro, procurando bugs reais com cenário de falha concreto, e cobrindo segurança quando a área é sensível. Não implementa a correção — devolve o veredito. Use quando o usuário pede "revisa o PR #N", "audita essa branch", "olha esse código de fulano". / Reviews someone else's code/PR for real bugs against project conventions and the brain.
argument-hint: "<PR, branch ou diff a revisar>"
---

# Plumb — revisar código de terceiros

Revise o diff de outra pessoa buscando **bugs reais**, cada um com um **cenário de
falha concreto**. Não corrija — o dono do código decide.

No idioma do usuário.

## Fluxo

1. **Entenda o escopo** do diff (PR/branch): o que ele muda e por quê. Com um
   gestor de tarefas ou `gh` conectado, leia o card/PR; sem acesso, peça o diff.
2. **Consulte o cérebro** pela área (`item_search`, `paths=<arquivos do diff>`): as
   `rule` do projeto são a régua da revisão; se a área tem `rule` com a tag
   `security` (ou toca auth, pagamento, dado pessoal, entrada externa, segredo),
   **ligue a lente de segurança**.
3. **Despache o `plumb-reviewer`** (lê o diff, não roda nada) com a base do diff, as
   convenções que valem e, quando for o caso, `<lente>seguranca</lente>`. Em diff
   pequeno, revise você, com o mesmo rigor.
4. **Repasse o veredito** em poucas linhas: bugs reais primeiro (com o cenário de
   falha e `arquivo:linha`), observações menores depois. Separe o que é bug do que
   é preferência.

## Quando gravar

Uma convenção que faltava e o diff revelou vira `rule`; um gotcha que você
descobriu revisando vira `howto/troubleshoot` — com o "sim" (inferido). Modelo em
`../plumb/references/brain.md`.

## Limites

Revisar o PR de outra pessoa fica **fora** do fluxo de mudança do Plumb: você não
cria spec nem worktree, não implementa. Só o veredito. Se o usuário pedir para
**corrigir** o que a revisão achou, aí sim é uma mudança (`plumb-change`).
