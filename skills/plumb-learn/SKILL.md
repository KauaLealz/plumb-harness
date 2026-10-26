---
name: plumb-learn
description: Grava o que dura como markdown no segundo cérebro — captura na hora a regra que o usuário DITOU ("sempre X", "a partir de agora…"), capta a CORREÇÃO do usuário ao jeito de trabalhar ("na verdade faz assim", "da próxima vez…") atualizando a preferência/regra relacionada, sintetiza o aprendizado no fecho de uma mudança e PROPÕE uma skill quando a sessão improvisou uma capacidade. Use quando o usuário ditar uma regra, corrigir o seu jeito de fazer, ou ao fechar uma mudança. É a única skill de escrita de conhecimento. Writes durable knowledge as markdown: instant capture of a dictated rule, reactive capture of a correction (updates the related preference), synthesis at a change's close, and proposes a skill.
---

# Plumb — learn (gravar o que dura)

**No idioma do usuário.** Você é a **única skill de escrita de conhecimento**. Faz quatro coisas:
**captura** a regra que o usuário ditou, capta a **correção** dele ao seu jeito de trabalhar,
**sintetiza** o aprendizado no fecho de uma mudança, e **propõe skills** quando a sessão improvisou
uma capacidade. Separado do `plumb-reflect` (que é a retro da sessão inteira).

Leia `playbook.md` (o teste de cada candidato, onde cada coisa mora, como escrever um bom `summary`,
quando o skill-creator dispara) uma vez. O modelo do cérebro:
`../plumb/references/knowledge-model.md`.

## Quatro entradas

- **Captura instantânea** — o usuário **ditou** uma regra/decisão/preferência ("sempre X", "aqui a
  gente…", "a partir de agora…", "nunca…", "lembra disso", "guarda que"). Grava **na hora**, confirma
  em uma linha. Não pede o "sim" (ele mesmo ditou).
- **Correção reativa** — o usuário **corrigiu o seu jeito de trabalhar** ("na verdade faz assim",
  "não era pra fazer assim", "da próxima vez…", "prefiro assim"). **Distinga** correção durável (sobre
  *como* a skill trabalha → persiste) de escolha pontual de produto (só desta vez → não vira nota).
  Durável: **atualize o item relacionado** (`preferences/<skill>.md` ou a `rule`), não crie um novo —
  é aprendizado reativo, a forma mais rica de preferência. Se a mesma correção já apareceu em outro
  projeto, é **candidata a promover para global** (ver `plumb-reflect`).
- **Síntese no fecho** — ao fechar uma mudança, varre os candidatos (o que travou e destravou, o que
  o usuário corrigiu/repetiu, decisões + porquê, convenção nova, pegadinha) e propõe gravar.
- **Skill-creator** — a sessão improvisou uma capacidade ou repetiu um procedimento que mereceria
  skill/playbook → **propõe** criar (como o `plumb-find-skills`). Só persiste com o "sim".

## Princípios

- **Ditado grava; inferido pede o "sim".** Um item errado envenena sessões futuras — por isso o que
  **você deduziu** só entra com a confirmação do usuário, e todo item global **sempre** pede o "sim".
- **O que dura, não o efêmero.** Cada candidato passa pelo teste do `playbook.md`. Bug é trabalho
  (vai para spec/card); medição datada, id de tarefa e o que o código/`AGENTS.md` mostram em segundos
  **não são nota**. Nunca segredo nem dado pessoal.
- **Anti-duplicata.** Leia a pasta (`.plumb/knowledge/` projeto + global) **antes** de escrever;
  atualize o arquivo existente em vez de criar variação.
- **Proporcional.** No trivial quase não há o que capturar — **não force item**. Nada para gravar é
  um resultado válido.

## Procedimento

1. **Leia antes de escrever.** Grep/Read em `.plumb/knowledge/` (projeto e global) na(s) área(s) que
   a mudança tocou — para não duplicar e para saber se atualiza um item que já existe.
2. **Monte os candidatos** (no fecho) ou **pegue o ditado** (captura instantânea). Para cada um,
   aplique o teste do `playbook.md`: dura? vale além desta sessão? não se redescobre em segundos?
3. **Classifique a fonte e o destino.** Ditado → grava. Inferido → propõe. Específico do projeto →
   `.plumb/knowledge/<área>/<item>.md`; transversal/pessoal → `~/.plumb/knowledge/` (global sempre
   pede o "sim"). Alcance e layout: `../plumb/references/knowledge-model.md`.
4. **Confirme o inferido** pela ferramenta de perguntas (recomendação primeiro; sem a ferramenta,
   lista numerada com a recomendação em 1º), cada item com a evidência (o trecho da fala ou do erro).
5. **Grave** como nota markdown com frontmatter `summary:` (1–2 frases **com o porquê**) + corpo —
   formato em `knowledge-model.md`. Regrave pela mesma área/arquivo; não duplique.
6. **Skill-creator:** se houve capacidade improvisada ou procedimento repetível, proponha a skill
   (nome + o que faria) e, com o "sim", siga o mecanismo de autoria de skill (compartilhado com o
   `plumb-find-skills`). Sem o "sim", não cria.

## Override (dev/empresa)

Se o `.plumb/knowledge/` já traz uma convenção da empresa sobre onde ou como registrar conhecimento,
ela **vence** o default (precedência projeto → global → default do harness).

## Cérebro opcional

Se a pasta não existir ou não der para escrever: avise em uma linha, siga, e deixe o que gravaria na
mensagem ao usuário. Nunca trave o trabalho por causa do cérebro.

## Saída

Confirme em linguagem humana o que entrou (`Guardei: valores em pagamentos são sempre centavos
inteiros.`), sem citar caminhos internos. No fluxo de uma mudança, após o `learn` segue o
`plumb-ship`.
