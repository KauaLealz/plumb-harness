---
name: plumb-find-skills
description: >-
  Achar OU criar skill: encontra skills de agente instaláveis quando falta ao
  time uma competência inteira que alguém já resolveu e, quando não existe
  nenhuma, PROPÕE criar uma skill nova (guardada, com revisão de segurança). Use
  quando o usuário perguntar "como faço X", "tem uma skill para X?", quiser
  ampliar o que o agente sabe fazer, quando um passo sinalizar "Ferramenta que
  falta", ou quando a sessão tiver improvisado uma capacidade que merecia uma
  skill. A recomendação vai ao usuário por múltipla escolha; o Plumb copia uma
  skill revisada (ou cria uma revisada) em vez de instalar direto; nada entra sem
  o "sim". / Find OR create agent skills: discovers installable skills when the
  team lacks a whole competency and, when none exists, proposes creating a new one
  (stored, security-reviewed). Nothing is installed or created without a "yes".
---

# Encontrar (ou criar) skills

**No idioma do usuário.** Skill é o que o agente **sabe fazer**. Quando falta uma
competência inteira — alguém já resolveu e empacotou, ou ninguém resolveu ainda —
a resposta é uma skill: **achar** uma instalável ou **criar** uma nova. As duas
entram **guardadas** (revisadas, só com o "sim").

Leia nada extra: o procedimento está aqui. Para criar, você compartilha o
mecanismo de autoria com o skill-creator do `plumb-learn`/`plumb-reflect`.

## Quando usar

- O usuário pergunta "como faço X", "tem uma skill para X?", "você consegue X?"
  (X é uma capacidade especializada).
- Quer ampliar o que o agente sabe fazer (design, testes, deploy, um domínio).
- Um passo sinalizou "Ferramenta que falta".
- A sessão **improvisou** uma capacidade ou repetiu um procedimento que mereceria
  virar skill (gatilho prospectivo; o retrospectivo é do `plumb-reflect`).

**Regra vs skill:** se for uma **restrição/convenção declarativa** ("conventional
commits", "evidência inclui screenshot"), não é skill — é **regra** em
`.plumb/knowledge/` (`../plumb/references/knowledge-model.md`). Skill é
**capacidade/procedimento invocável** com passos próprios.

## Parte 1 — Achar uma skill existente

### O que é a CLI de skills

`npx skills` é o gerenciador do ecossistema aberto de skills. Comandos:

- `npx skills find [query] [--owner <owner>]` — busca por palavra-chave, opcional
  por dono do GitHub.
- `npx skills add <owner/repo@skill>` — instala a partir do GitHub.
- `npx skills update` — atualiza as instaladas.

Catálogo: https://skills.sh/ (o leaderboard ranqueia por instalações — comece por
ele para ver se já existe algo consolidado no domínio).

### Buscar e qualificar

1. **Entenda a necessidade:** domínio (React, testes, deploy…), tarefa específica,
   e se é comum a ponto de já existir skill.
2. **Leaderboard primeiro**, depois `npx skills find <query específica>` (ex.:
   `react performance`, `pr review`, `changelog`).
3. **Qualifique antes de recomendar** (nunca só pelo resultado da busca):
   instalações (prefira 1K+; desconfie de <100), reputação da origem (oficiais
   como `vercel-labs`, `anthropics`, `microsoft` > autor desconhecido), estrelas
   do repo (<100 estrelas = ceticismo).

### Propor (nunca instalar direto)

Skills de terceiro rodam com as permissões do seu agente (um estudo Snyk de 2026
achou problemas críticos em ~13% das skills publicadas, e maliciosas confirmadas).
Por isso:

1. **Mostre o candidato** (origem, estrelas/instalações, licença, última
   atualização) e pergunte se segue — pela **ferramenta de perguntas** (lista
   numerada com a recomendação na opção 1 quando não houver).
2. Com o "sim": leia o `SKILL.md` e **todo** arquivo em `scripts/` antes de
   instalar, e rode um scanner de segurança de skill se houver.
3. **Prefira copiar** para o repositório curado de skills do usuário, **pinada num
   commit** (com origem e licença), em vez de instalar direto do registro.
   Instale direto só se o usuário pedir: `npx skills add <owner/repo@skill> -g`.
   Nunca passe `-y` — a confirmação é parte da revisão.

## Parte 2 — Criar uma skill nova (quando não há)

Se a busca não achou nada que sirva, **ofereça criar** uma skill — não apenas
"faço na mão desta vez".

1. **Confirme que vale:** é uma capacidade que vai **repetir**? No descartável,
   faça direto e não crie skill.
2. **Proponha pela ferramenta de perguntas** o que a skill faria (nome, gatilho,
   passos em uma linha). **Só cria com o "sim".**
3. **Autore** com o mesmo mecanismo do skill-creator (`plumb-learn`/
   `plumb-reflect`): `SKILL.md` enxuto (description bilíngue, gatilho claro) +
   `playbook.md` quando houver expertise profunda. Siga o tom das skills do Plumb.
4. **Guardada, revisada:** a skill nova passa pela mesma revisão de segurança de
   uma de terceiro antes de entrar, e é **copiada para o repositório curado**
   (não instalada solta). Entra só com o "sim".

## Quando nada serve e não vale criar

Diga que não achou skill e que criar não se paga aqui; siga com a capacidade geral
do agente e registre no cérebro o que durar (via `plumb-learn`).
