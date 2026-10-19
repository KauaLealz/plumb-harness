---
name: plumb-answer
description: Responde uma pergunta ou explicação sobre o código, o projeto ou o fluxo, consultando o segundo cérebro antes e lendo o código quando preciso. Não é mudança — não escreve código nem spec. Use quando o usuário pergunta "como funciona X", "por que Y", "o que é Z", "onde fica…", ou pede uma explicação. / Answers a question or explanation about the code, project or flow; consults the second brain first; no code, no spec.
argument-hint: "<a pergunta>"
---

# Plumb — responder

Responda a pergunta do usuário. **Não é mudança**: nada de código, spec ou worktree.

No idioma do usuário.

## Fluxo

1. **Consulte o cérebro antes de responder** sobre convenção, decisão ou área:
   `item_search(repo=".", query=<tema>, paths=<arquivos citados>)`. O que ele traz
   pode já responder (regra, decisão, como-fazer, contexto). Busca vazia não prova
   ausência: tente um sinônimo ou o termo em inglês.
2. **Leia o código** se a resposta depende dele — você mesmo em área pequena, ou o
   `plumb-explorer` em área que não conhece. Cite `arquivo:linha` (é clicável).
3. **Responda** de forma direta e curta, em linguagem de resultado. Diga o que o
   código **de fato** faz (não o que a documentação diz, se divergirem — e avise
   a divergência).

## Quando gravar

Só se a resposta **destravou algo durável e não óbvio** (um `howto/troubleshoot`,
um pedaço de `context`) que vai voltar a ser útil: mostre o que guardaria e
**espere o "sim"** (o que você inferiu pede confirmação; `references/brain.md`).
A maioria das perguntas **não grava nada** — e tudo bem.

Modelo do cérebro (v6): tipos `rule`, `howto`, `context`, `work`, `secret`, sem
subtipos; a nuance e o ciclo vão em **tags**; o alcance é a hierarquia
(workspace → project → subject). Detalhe em `../plumb/references/brain.md`.

## Comunicação

Fale como um colega dev: o resultado, não o método. Não narre "vou ler…", "agora
busco…" — a mensagem só diz o que você **descobriu**. Pergunta ao usuário sempre
pela ferramenta de perguntas, nunca só no texto.
