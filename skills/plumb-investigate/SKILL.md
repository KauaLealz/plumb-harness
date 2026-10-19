---
name: plumb-investigate
description: Investiga uma pergunta aberta sobre o sistema ("por que isso acontece", "vê se dá para…", "o que causaria…") lendo o código e consultando o cérebro, sem mudar nada. Só leitura; a resposta vai ao usuário e o que durar vira howto ou context. Use para diagnóstico, viabilidade e exploração antes de decidir uma mudança. / Investigates an open question (read-only); the finding goes to the user and durable learning becomes a howto/context.
argument-hint: "<o que investigar>"
---

# Plumb — investigar

Responda uma pergunta de investigação **só lendo** — nada muda no código.

No idioma do usuário.

## Fluxo

1. **Busque pelo sintoma antes de qualquer hipótese**: `item_search(repo=".",
   query=<sintoma>, paths=<área>)`. Um `howto/troubleshoot` guardado vale mais que
   um palpite.
2. **Explore o código**: você em área pequena; o `plumb-explorer` (uma pergunta
   concreta por explorador, até 3 em paralelo) em área que não conhece. Ele devolve
   a convenção que o código **de fato** segue e as contradições com o que está escrito.
3. **Para "por que" (um bug):** siga o começo do loop de diagnóstico — reproduza o
   caso (um comando que mostra o erro), minimize ao menor caso que falha, levante a
   **hipótese da causa** (não do sintoma) e, se der, **instrumente** (log/asserção)
   para confirmar a causa. Não corrija aqui: a correção é `plumb-fix`/`plumb-change`.
4. **Responda ao usuário** com o achado e, se couber, o próximo passo numa frase
   afirmativa.

## Quando gravar

O que **durar** e foi não óbvio: um `howto/troubleshoot` (sintoma → causa →
solução) ou um `context` (como a área funciona). Mostre e **espere o "sim"** (foi
inferido). Busca, exploração e gravação seguem `../plumb/references/brain.md`.

## Comunicação

Descreva o resultado, não o método. Perguntas ao usuário pela ferramenta de
perguntas. Evidência em palavras simples ("reproduzi com este comando e o erro é X").
