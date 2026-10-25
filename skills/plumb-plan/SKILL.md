---
name: plumb-plan
description: Desenha sem construir — explora, entrevista e escreve a spec aprovada, e PARA antes do código. Use quando o usuário quer decidir o rumo ou a arquitetura antes de implementar ("vamos desenhar X", "me ajuda a planejar Y", "qual a melhor arquitetura para Z", "planeja", "discovery", "arquitetura antes de construir"). Na profunda, compara abordagens e sintetiza a recomendada com o porquê. Não escreve código. Designs without building — explores, grills and writes the approved spec, then stops before any code; compares approaches and synthesizes the recommended one when complex; writes no code.
---

# Plumb — plan (desenhar sem construir)

**No idioma do usuário.** Você desenha com o usuário o rumo ou a arquitetura de uma mudança e
**para antes do código**. O entregável é a **spec aprovada** (`.plumb/work/<id>.md`); quando o
usuário quiser construir, o fluxo de código retoma dela. É a **mesma maquinaria** do fluxo de
mudança — `explore` → `plumb-grill` → `plumb-spec` — com um **ponto de parada diferente**: a
aprovação, não a implementação.

Leia `playbook.md` (como planejar bem) uma vez. O cérebro é opcional e aqui é **só leitura**
(`../plumb/references/knowledge-model.md`).

## Princípios

- **Desenhar, não construir.** O entregável é a decisão e a spec. **Não escreva código** — nem um
  rascunho de implementação. Aprovada a spec, você para.
- **O plano bate com o que o código faz.** Desenhe sobre a realidade do repositório, não sobre o que
  ele deveria fazer: explore antes (`explore`, proporcional ao score).
- **O que fica em aberto volta ao grill, não vira suposição.** Num plano, as decisões abertas **são**
  o trabalho. Nada que mude o resultado é inferido em silêncio.
- **Profunda = comparar e sintetizar.** Com 2+ abordagens plausíveis, compare-as de ângulos
  diferentes, enxerte o melhor de cada e recomende uma **com o porquê**. A escolhida vai em **1 linha
  no Objetivo** da spec — **sem seção Design** (`playbook.md`).

## Procedimento

1. **Explore o rumo.** Rode `explore` na área (profundidade pelo score): o que o código de fato faz,
   o `.plumb/knowledge/` (projeto + global), o card, restrições e pontos de integração. Falta
   ferramenta? `plumb-find-docs` (lib antes de desenhar sobre ela), `plumb-find-mcps` (sistema sem
   acesso).
2. **Grill.** Chame `plumb-grill` sobre o tema: alinhe a árvore de decisões (requisitos, restrições,
   trade-offs, fora de escopo) até o entendimento compartilhado. O que a exploração já respondeu não
   vira pergunta; o que muda o resultado e não dá para inferir, vira.
3. **Spec (com design quando complexo).** Chame `plumb-spec` para transformar o Combinado em spec.
   Na profunda, o **modo design** compara 2+ abordagens e condensa a escolhida em 1 linha no Objetivo.
   Rode o **spec-lint** e o **gate de aprovação**.
4. **Pare.** Aprovada a spec, o planejamento terminou. Não implemente.

## Saída → próximo passo

Entregue a **spec aprovada** em `.plumb/work/<id>.md` (resumo em linguagem de resultado, sem ids
internos). O planejamento acaba aqui. **Quando o usuário quiser construir**, o próximo passo é
implementar via **`plumb-code`** a partir desta spec — o fluxo de código retoma dela (grill/spec já
estão feitos). Diga isso em uma frase afirmativa: `Quando quiser, o próximo passo é construir a
fase 1 com o plumb-code.`
