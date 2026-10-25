---
name: plumb-grill
description: Entrevista o usuário até os dois terem o mesmo entendimento do que será feito, ANTES da spec — o agente decide quantas rodadas, o tema de cada uma e quantas perguntas por rodada, pelo que ficou ambíguo ou é perigoso inferir. Explora antes, recomenda primeiro, toca de volta o "Combinado" no fim; não escreve spec nem código e não grava nada durável. Use quando o usuário disser "me entrevista", "me faz perguntas", "grill", "alinhar antes de começar", "/plumb-grill <tema>", ou quando a trilha entrar na fase de alinhar. Interviews the user round by round until you share an understanding of what will be built; the agent decides rounds, themes and questions per round; explores first, recommends first, echoes the agreement back; writes no spec and no code.
argument-hint: "<tema a alinhar>"
---

# Plumb — grill (entrevistar até o entendimento)

**No idioma do usuário**, inclusive as frases de andamento. Você entrevista até haver **entendimento
compartilhado** do que será feito — o insumo do `plumb-spec`. Esta skill **só entrevista**: não
escreve spec, não escreve código, **não grava nada durável** no cérebro.

Leia `playbook.md` (como entrevistar bem) uma vez. O cérebro é opcional e aqui é **só leitura**
(`../plumb/references/knowledge-model.md`).

Tema: $ARGUMENTS (se vazio, o assunto da última mensagem do usuário).

## Princípios

- **Explore antes de perguntar.** O que o código, o `.plumb/knowledge/` (projeto + global), o card
  ou a conversa já respondem **não vira pergunta** — use a resposta e siga. Contradição entre fontes
  **é** a pergunta.
- **Amplitude é julgada por você.** Decida o **nº de rodadas**, o **tema de cada rodada** e o **nº de
  perguntas por rodada** pelo que ficou **ambíguo**, pelo que **não faz sentido inferir** ou é
  **perigoso inferir**. Rodadas por tema; múltiplas rodadas são permitidas. Não há cota fixa.
- **Recomendação primeiro.** Toda pergunta leva de 2 a 4 opções, a recomendada na frente; cada opção
  diz a consequência em uma frase (formato no `playbook.md`).
- **Encerra quando a árvore esgota.** Pare quando a ambiguidade baixa: só restam decisões que **não
  mudam o resultado** ou cujo erro **não custa refazer**. Não entreviste por entrevistar.
- **Nada durável.** O resultado alimenta o `plumb-spec`; nada é gravado no cérebro aqui.

## Procedimento

1. **Explore o tema.** Leia o código da área e o `.plumb/knowledge/`, veja o card e a conversa.
   Proporcional ao score: quanto mais trivial, mais leve a exploração.
2. **Monte a árvore de decisões** e **pode** os ramos que a exploração já fechou (`playbook.md`).
   Agrupe o que sobrou **por tema** — cada grupo é uma rodada.
3. **Rode uma rodada por vez.** Mande as perguntas daquela rodada **juntas**, numa só chamada da
   ferramenta de perguntas (`AskUserQuestion`, até 4 por chamada), nunca pingando uma a uma. Uma
   decisão por pergunta, recomendada primeiro.
4. **Reavalie e decida se há próxima rodada.** As respostas podem fechar ramos ou **abrir** novos;
   só abra rodada nova se restou algo que muda o resultado e cujo erro custaria refazer. Repita até
   a árvore esgotar.
5. **Toque de volta o "Combinado"** (formato no `playbook.md`) e **confirme** pela ferramenta de
   perguntas. Nada além disso acontece enquanto o usuário não confirmar; se ele corrigir, ajuste e
   confirme de novo.

Sem a ferramenta de perguntas (Cursor): as mesmas perguntas em **lista numerada**, todas na mesma
mensagem, com a recomendação na **opção 1**.

## Saída → próxima skill

Entregue o **"Combinado"** confirmado. Com entendimento fechado, aponte o **`plumb-spec`** (que
transforma o Combinado em spec) — ou, se o usuário só queria **alinhar** (`/plumb-grill` avulso),
pare aqui: o alinhamento é o entregável.
