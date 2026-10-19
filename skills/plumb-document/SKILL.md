---
name: plumb-document
description: Gera ou atualiza documentação (README, docs do repositório, comentários de alto nível, guia de uso) a partir do que o código de fato faz, consultando o cérebro antes. Use quando o usuário pede "documenta X", "atualiza o README", "escreve um guia de…". A documentação descreve só o comportamento atual; decisão e porquê duráveis vão para o cérebro. / Writes or updates docs from what the code actually does.
argument-hint: "<o que documentar>"
---

# Plumb — documentar

Produza ou atualize documentação fiel ao que o código **faz hoje**.

No idioma do usuário (a doc em si, no idioma que o projeto usa).

## Fluxo

1. **Consulte o cérebro** pelo tema e pela área (`item_search`): convenções de
   documentação, glossário, mapa do código já podem existir e guiam o tom e os termos.
2. **Leia o código** da área (você ou o `plumb-explorer`) para documentar o
   comportamento **real**, não o pretendido.
3. **Escreva/atualize** a doc. Regra do projeto: a **documentação descreve só o
   comportamento atual** — sem roadmap, histórico, auditoria nem menção a legado;
   regra e decisão durável vão para o cérebro, não para a doc.
4. **Prove**: se há como (um link checker, um `markdownlint`, o build da doc),
   rode e reporte; senão, releia e confira que cada afirmação bate com o código.

## Quando gravar no cérebro

O **contexto durável** que você levantou documentando (mapa do código, glossário,
stack, ambiente) vira `context`, com o "sim" (foi inferido). Modelo em
`../plumb/references/brain.md`.

## Entrega

Diga o que ficou documentado e onde. Nada sai da máquina (push, PR) sem o "sim" do
usuário, pela ferramenta de perguntas.
