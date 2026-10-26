# O que a skill precisa saber — explorar → perguntar na dúvida → aprender

Cada skill precisa de duas coisas para fazer o trabalho **certo**: **fatos operacionais** (ex.: a
`qa` precisa saber o que testar, onde está rodando, onde estão os cenários; a `ship`, o formato do
PR) e **preferências do dev/time** (como testar, como revisar, como commitar, o formato do
entregável). O `playbook.md` traz o jeito **genérico**; este mecanismo mantém o **dev no loop** e faz
a skill **aprender**, para não reinterrogar nas próximas vezes.

## O ciclo (toda skill, antes e durante o trabalho)

1. **Explore primeiro.** Leia o código, o `.plumb/knowledge/` (projeto + global, inclui
   `preferences/<skill>.md`) e o card. O que isso já responde **não vira pergunta**.
2. **Na dúvida, pergunte — sempre.** O que você precisa para fazer certo e **não** achou: pergunte
   pela ferramenta de perguntas (recomendação primeiro). **Nunca adivinhe** fato operacional (onde
   roda, onde estão os cenários, qual ambiente, formato do entregável). Melhor uma pergunta a mais
   que entregar errado. Explorar é para **cortar pergunta desnecessária**, não para parar de perguntar.
3. **Após CADA resposta, passe pelo `plumb-learn`.** A resposta é durável (vale além desta sessão) e
   reaproveitável? O `plumb-learn` grava — no **projeto** (fato/convenção do repo: onde roda, onde
   estão os cenários, template do time) ou **global** (preferência pessoal do dev). Assim, **da
   próxima vez a skill já sabe** e não pergunta de novo. Resposta só desta vez (um valor pontual) não
   vira nota.
4. **Siga a preferência/fato salvo.** Precedência: **projeto → global → o playbook (default)**.

No **trivial** (score baixo), não interrogue à toa: use o que explorou e o default, e pergunte só o
que de fato trava o trabalho.

## Exemplo — `qa`

O dev pede "testa isso". A `qa` explora (acha a suíte, o runner, o `AGENTS.md`); o que não achou,
pergunta: **o que** é o comportamento a provar, **onde** está rodando (local, container, staging),
**onde estão os cenários/fixtures**, e o **formato do entregável** (relatório? print? só o verde?).
Cada resposta passa pelo `plumb-learn`: "os cenários ficam em `tests/e2e`" → nota de **projeto**;
"prefiro o resumo dos testes como uma tabela" → preferência **global**. Na próxima vez, já sabe tudo
isso e só pergunta o que for novo. **A ideia é essa para todas as skills.**

## Onde grava (alcance)

- **Preferência do dev** (como *ele* gosta): **global** — `~/.plumb/knowledge/preferences/<skill>.md`
  — viaja entre projetos. Ele mesmo escolheu: grava.
- **Fato/convenção do repo** (onde roda, cenários, template do time): **projeto** —
  `.plumb/knowledge/` (em `preferences/<skill>.md` se é "como a skill faz", ou na área se é um fato
  do sistema). O do projeto **vence** o global. Na dúvida entre pessoal e do time, pergunte o alcance
  uma vez.

## Como aparece na sessão

O pacote do `SessionStart` resume todo o `.plumb/knowledge/` (inclui `preferences/`), então o agente
em geral já **sabe** o que está salvo antes de rodar a skill — e lê o arquivo para o detalhe.

## Formato de `preferences/<skill>.md`

```markdown
---
summary: Como <dev/time> gosta de <skill> — <uma frase>.
tags: [preferencia, <skill>]
---

# Preferências de <skill>

- <dimensão>: <escolha> — <porquê/observação>
```

## Mudou de ideia

É um arquivo: o dev edita, ou pede para ajustar (cai no `plumb-learn`). Se o dev **corrige** o jeito
que a skill fez numa sessão, isso **atualiza** a preferência (aprendizado reativo), não duplica.
