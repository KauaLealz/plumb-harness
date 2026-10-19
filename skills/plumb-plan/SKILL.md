---
name: plumb-plan
description: Planeja sem construir — design, discovery ou arquitetura que produz um plano e decisões, mas não vira código agora. Use quando o usuário quer desenhar uma solução, comparar abordagens, estruturar uma feature grande ou decidir um rumo antes de implementar ("vamos desenhar X", "me ajuda a planejar Y", "qual a melhor arquitetura para Z"). Conduz um grill robusto, explora o necessário, produz um item `work` (rascunho) com o plano e as `rule` das decisões, e para antes de escrever código. Não use quando o pedido já é para implementar (use plumb-change), nem para uma pergunta simples (plumb-answer).
disable-model-invocation: true
---

# Plumb — planejar

**No idioma do usuário.** Você desenha com o usuário uma solução ou um rumo, e
**para antes do código**. O que sai é um plano aprovado e as decisões registradas —
quando ele quiser construir, o `plumb-change` parte daqui.

O segundo cérebro entra em toda fase (`../plumb/references/brain.md`, leia uma vez):
o plano é um item **`work`** com a tag `draft`; as decisões são `rule` (com o porquê
e a alternativa descartada no `content`).

## 1 — Entender

- **Explorar (só leitura):** `plumb-explorer` na área, ou leia você se for pequena —
  o plano precisa bater com o que o código **de fato** faz.
- **Consultar o cérebro:** decisões anteriores na área (uma `rule` que o plano
  contraria vira pergunta), `context` do produto e do mapa.
- **Checagem de ferramentas:** usa biblioteca cujo uso não está no código →
  `plumb-find-docs` antes de desenhar sobre ela; sistema sem acesso →
  `plumb-find-mcps`; competência que falta → `plumb-find-skills`.

## 2 — Alinhar (grill robusto)

Leia `../plumb-align/SKILL.md`. Entreviste o usuário com todas as perguntas de uma
vez (recomendação primeiro), **sem inferir o que muda o resultado** — num plano, as
decisões em aberto são o trabalho, não suposições. Cubra a árvore de decisões que a
exploração deixou: requisitos, restrições, trade-offs, o que fica fora de escopo.
Até haver entendimento compartilhado.

## 3 — Desenhar

Produza o plano. Na profunda (2+ abordagens plausíveis), despache `plumb-planner`
para gerar e comparar as opções (cada uma de um ângulo), com os trade-offs; sintetize
a recomendada, enxertando o que as outras têm de melhor. Área pequena que você já
leu: desenhe você, pelo formato do planejador.

O plano traz: **objetivo**, **fora de escopo**, **resultados esperados** (o que se
observa), **abordagem recomendada** com o porquê e as descartadas, e, se vira
construção depois, as **fases** (papel, dependência, critério de saída). Perguntas
em aberto voltam ao grill, não viram suposição.

## 4 — Gravar e apresentar

- O plano: item **`work/<id>`**, tag `draft` + tag de área, no project certo.
- As decisões que já valem (independentes de implementar): `rule/<nome>` cada,
  `origin` certo (`user` o que ele ditou, `agent` o inferido) — o inferido pede o
  "sim" antes de gravar.
- `links` (`relates_to`) entre o `work` e as `rule` que ele gera.

Apresente o plano (em linguagem de resultado, sem ids internos) e termine com o link
`url`. **Não escreva código.** Se o usuário aprovar e pedir para construir, aí sim é
`plumb-change`, que retoma deste `work`. Próximo passo óbvio que não é seu: uma
frase afirmativa (`Quando quiser, o próximo passo é implementar a fase 1.`).
