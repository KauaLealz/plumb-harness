---
name: plumb-grill
description: Entrevista o usuário com todas as perguntas de uma vez (numa só chamada da ferramenta de perguntas) e sempre com a recomendação do agente, até os dois terem o mesmo entendimento do que será feito — sem escrever spec nem código. Use quando o usuário disser "me entrevista", "me faz perguntas", "grill me", "quero alinhar antes de começar", "/plumb-grill <tema>", ou quando o orquestrador entrar na fase de alinhar. Interviews the user with all questions at once (batched in a single tool call), each with a recommended answer, until you share an understanding; writes no spec and no code.
argument-hint: "<tema a alinhar>"
---

# Plumb — grill

Entreviste o usuário sobre o tema até haver **entendimento compartilhado**. Esta
skill só entrevista: não escreve spec, não escreve código, não grava no cérebro
(exceto o que o usuário ditar como regra, pela rota Diretriz do orquestrador).

Tema: $ARGUMENTS (se vazio, o assunto da última mensagem do usuário)

No idioma do usuário, inclusive as frases de andamento.

## Protocolo

1. **Explore antes de perguntar.** Leia o código da área, consulte o cérebro
   (`item_search(repo=".", query=<tema>, paths=<arquivos>)`), o card (se houver) e
   a conversa. Se algo disso responde a dúvida, não a transforme em pergunta: use
   a resposta e siga. Se elas se contradizem, a contradição é a pergunta.
2. **Monte a árvore de decisões** do tema e pode os ramos que a exploração já
   fechou: só sobra o que a resposta muda e cujo erro custaria refazer. O que
   sobrou é o conjunto de perguntas que você vai mandar.
3. **Todas as perguntas de uma vez.** Reúna as perguntas que sobraram e mande-as
   **juntas**, numa só chamada da ferramenta de perguntas do Claude
   (`AskUserQuestion`), nunca só no texto. A ferramenta aceita até 4 perguntas por
   chamada; se sobraram mais, use o menor número de chamadas possível. Nunca pingue
   uma pergunta de cada vez. Se a própria existência de uma pergunta depende da
   resposta de outra, deixe essa para uma segunda chamada curta.
4. **Sempre com a recomendação.** De 2 a 4 opções; a recomendada é a **primeira**
   e leva "(Recommended)" no rótulo (no idioma do usuário, se a ferramenta
   mostrar outro texto, mantenha o marcador). A descrição de cada opção diz a
   consequência em uma frase. Quando uma skill ou MCP que já existe (ou que as
   buscas `plumb-find-*` achariam) serve àquela decisão, a recomendação já diz
   isso: "recomendo X, usando a skill Y" ou "o MCP Z lê o card, sem você colar".
5. **Termine com o resumo do entendimento compartilhado** e peça a confirmação
   pela ferramenta de perguntas. Nada além disso acontece (spec, código, worktree)
   enquanto o usuário não confirmar. Se corrigir, ajuste o resumo e confirme de novo.

Sem a ferramenta de perguntas (Cursor, ou uma ferramenta que não a tenha), as
mesmas perguntas em texto numerado, todas na mesma mensagem, cada uma com a
recomendação na opção 1.

## Formato de cada pergunta

```
Contexto: <uma linha — o que você já sabe e por que esta pergunta importa>
Pergunta: <uma decisão só, em linguagem de produto>
Opções:
1. <a recomendada> (Recommended) — <consequência em uma frase>
2. <alternativa> — <consequência>
3. <alternativa, se houver> — <consequência>
```

Na ferramenta: o contexto vai no texto da pergunta, a pergunta é o `question`, as
opções são as `options` (recomendada primeiro).

## O que não perguntar

- O que o código, o cérebro, o card ou a conversa já respondem.
- Escolha de implementação (nome, estrutura de arquivo, biblioteca que o projeto
  já usa): é do agente.
- Mais de uma decisão na mesma pergunta; pergunta retórica; pedido de licença para continuar.
- O que não muda o que será construído nem o custo de refazer.

Uma pergunta só vale se **a resposta muda o resultado** e **errar custaria
refazer**. Se o usuário disser "decide você", decida o que falta recomendando a
opção de cada pergunta que restava e registre isso como um combinado **daquele
tema** ("o usuário pediu para escolher o resto em AAAA-MM-DD"); não vira regra
geral nem vale para outro pedido.

## Resumo do entendimento (o que sai no fim)

```
**Entendimento combinado — <tema>**

- Objetivo: <o resultado, em uma frase>
- Fica de fora: <o que ficou combinado não fazer>
- Combinado: <cada decisão tomada, com a opção escolhida e o porquê em meia frase>
- Em aberto: <o que ainda depende de alguém, ou "nada">
```

Confirmação pela ferramenta de perguntas: "Confirma esse entendimento?" com a
opção recomendada primeiro (confirmar) e "Ajustar" em seguida.

## Quando o orquestrador chama

Nas trilhas padrão e profunda o orquestrador lê esta skill na fase Alinhar e
segue o mesmo protocolo; o resumo confirmado vira o "Combinado" da spec. Na
trilha direta só se o pedido for ambíguo, e então basta uma pergunta.
