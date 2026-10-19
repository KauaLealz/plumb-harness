---
name: plumb-capture
description: Captura uma diretriz, regra, decisão ou preferência que o usuário ENUNCIOU ("sempre…", "aqui a gente…", "a partir de agora…", "nunca…") e grava na hora no segundo cérebro, confirmando em uma linha. Não escreve código nem spec. Use sempre que o usuário ditar uma regra de como trabalhar ou uma decisão durável. / Captures a rule/decision/preference the user stated and saves it to the second brain immediately.
argument-hint: "<a diretriz>"
---

# Plumb — capturar diretriz

O usuário **ditou** uma regra, decisão ou preferência. Grave **na hora** e confirme
em uma linha. Sem spec, sem código.

No idioma do usuário.

## Fluxo

1. **Antes de gravar, busque** (duplicata): `item_get` pela key que usaria e
   `item_search` pelo tema. Se já existe um item que diz o mesmo, **regrave pela
   mesma key** (não duplique). Se **contradiz** um item existente, ligue o novo ao
   antigo por `relation_create` (`rel: relates_to`) e deixe claro qual vale.
2. **Grave** com `item_save(repo=".")`:
   - `type: rule` (o padrão para uma diretriz); `key: rule/<nome-kebab>`.
   - `summary` de 1–2 frases **com o porquê**.
   - `content` com o **## Por quê** e, se for uma escolha entre alternativas, a
     **## Alternativa descartada**.
   - `tags`: 1 a 3 de área/tema (de `tag_list`, reaproveitando), mais a nuance
     quando couber (ex.: `security`, `process`, `business`).
   - **Onde mora** define o alcance: uma regra que vale só no project fica no
     project; uma que vale no workspace inteiro (ex.: todos os microsserviços de
     uma empresa) **mora no workspace** (sem `project`).
3. **Confirme em uma linha**, em linguagem humana:
   `Guardei para as próximas vezes: valores em pagamentos são sempre centavos inteiros.`

O que o usuário **ditou** grava direto (não pede "sim"). Só o que **você inferiu**
pede confirmação — mas aqui, por definição, foi ditado.

Modelo do cérebro (v6) e as regras de gravação: `../plumb/references/brain.md`.
Não é item: bug, andamento, medição datada, id de tarefa.

## Cérebro fora do ar

Avise em uma linha, siga, e guarde a entrada do `item_save` em
`~/.knowledge-os/pending.jsonl` (uma por linha).
