---
name: plumb-find-mcps
description: >-
  Hub de MCPs do Plumb: encontra, recomenda e — quando não existe pronto —
  propõe CRIAR um servidor MCP, sempre que falta ao agente *acesso* a um sistema
  externo (card, banco, erro de produção, design, deploy) ou aos sistemas de
  ciclo de vida (banco, filas, observabilidade, cloud). Também oferece o
  knowledge-os como acelerador OPCIONAL do `.plumb/knowledge`. Use na checagem de
  ferramentas ao entender um pedido que cita um sistema que você não alcança ("o
  card diz…", "dá erro em produção", "segue o design"), quando o mesmo acesso
  faltar de novo, no `plumb-init` e no `plumb-reflect`. A recomendação vai ao
  usuário por múltipla escolha; nada é instalado nem criado sem o "sim". / MCP
  hub: finds, recommends and — when none exists — proposes CREATING an MCP server
  whenever the agent lacks access to an external system (ticket, database,
  production errors, design, deploy) or lifecycle systems (db, queues,
  observability, cloud); also offers knowledge-os as an optional accelerator.
---

# Encontrar MCPs (hub de acesso)

**No idioma do usuário.** Skill é o que o agente **sabe fazer**; MCP é o que ele
**alcança**. Quando o trabalho trava porque uma informação existe mas está fora
do alcance — o card no Jira, a linha no banco, a mensagem na fila, o erro no
Sentry — a resposta é uma **ferramenta**, não mais instrução.

Este é o **hub de MCPs**: achar o que existe, cobrir o ciclo de vida, oferecer o
knowledge-os como acelerador opcional e, quando não há MCP pronto, **propor criar
um sob medida** (guardado, só com o "sim").

## Quando usar

- A checagem de ferramentas (ao entender o pedido) achou um sistema citado sem
  acesso, ou a mesma falta apareceu mais de uma vez (o `plumb-learn` no fecho e o
  `plumb-reflect` detectam isso).
- O usuário menciona um sistema que você não consegue consultar ("o card diz…",
  "em produção dá erro X", "segue o Figma").
- No `plumb-init`, ao levantar a stack do projeto.
- Um passo sinalizou "Ferramenta que falta".

**Não use** para o que não muda o trabalho: se o agente nunca vai precisar daquele
acesso em nenhuma fase, a ferramenta só custa contexto.

## O que procurar, por fase do trabalho

| Falta | Fase | Categoria de MCP |
|---|---|---|
| Ler o card, mudar status, comentar | Entender · Entregar | tarefas (Jira, Linear, Monday, Trello, ClickUp, Asana) |
| Ver o design antes de construir tela | Entender · Construir | design (Figma) |
| Ler a spec escrita fora do código | Entender | documentação (Notion, Confluence, Google Drive) |
| API de biblioteca atual | Entender · Construir | já resolvido: skill `plumb-find-docs` |
| Conferir schema, olhar dado real | Entender · Provar | **banco (somente leitura)** (Postgres, MySQL, Mongo, Redis) |
| Inspecionar fila/tópico, mensagem real, DLQ | Provar · investigação | **filas** (Kafka, RabbitMQ, SQS/SNS, Redis Streams) |
| Ver o erro que o usuário teve | Provar · investigação | **observabilidade** (Sentry, Datadog, Grafana, New Relic) |
| Exercitar a interface de verdade | Provar | navegador |
| Conferir deploy, variável de ambiente, log | Entregar | **deploy / cloud** (Railway, Vercel, AWS, Fly, Render) |

As quatro linhas em negrito são os **MCPs de ciclo de vida** — banco, filas,
observabilidade e deploy/cloud. O ciclo de vida é cidadão de primeira classe no
v7, e boa parte da prova (`plumb-qa`) e do diagnóstico (`plumb-ask`) depende
desse acesso.

## O knowledge-os é opcional (acelerador, não motor)

O segundo cérebro do v7 são **arquivos markdown** em `.plumb/knowledge/` (projeto)
e `~/.plumb/knowledge/` (global) — lidos **direto**, sem MCP
(`../plumb/references/knowledge-model.md`). Tudo funciona **sem** nenhum MCP de
conhecimento.

O **`knowledge-os`** é um MCP **opcional** que roda **por cima dos mesmos
arquivos**: dá busca semântica, grafo de ligações e UI. Oferte-o (como qualquer
outro MCP, pela ferramenta de perguntas) quando o cérebro do projeto cresceu e o
usuário quer busca/servidor em cima dele — tipicamente no `plumb-init`. Deixe
claro que é acelerador, não dependência: sem ele o Plumb lê os arquivos
normalmente.

## Como procurar

1. **Já instalado?** Antes de propor, confira o que já existe nesta máquina — a
   ferramenta pode estar lá e ninguém saber (`claude mcp list`).
2. **Oficial primeiro.** Quase todo produto popular tem um MCP oficial ou mantido
   pelo próprio fabricante. Procure por `<produto> MCP server` e prefira o do
   fabricante ao de terceiro.
3. **Registro.** O catálogo oficial do Model Context Protocol e as listas da
   comunidade (`modelcontextprotocol/servers`) cobrem a maioria dos casos.

## Achar OU criar — MCP sob medida (guardado)

Se não existe MCP pronto para o acesso que falta (API interna, sistema
proprietário, integração que ninguém publicou), você pode **propor criar um MCP
sob medida** — um servidor fino que expõe só as operações necessárias, de
preferência **somente leitura**.

- Criar é guardado, como instalar: **propõe** pela ferramenta de perguntas,
  explicando o que o MCP exporia e qual credencial pede; **só constrói com o
  "sim"**.
- O MCP novo passa por **revisão de segurança** antes de entrar (roda com as
  permissões da conta do usuário). Compartilha o mecanismo de autoria com o
  skill-creator do `plumb-learn`/`plumb-reflect`: gerar, revisar, guardar pinado.
- Comece pelo **menor escopo** que destrava a fase. Banco e produção, **sempre**
  somente leitura.

## Antes de propor, responda três coisas

| Pergunta | Por que importa |
|---|---|
| **Qual fase isso destrava?** | Se não destrava nenhuma, não proponha |
| **Precisa escrever?** | Prefira somente leitura. Banco e produção, **sempre** somente leitura |
| **Que credencial pede?** | Entra na **config do próprio MCP** (env / cofre do SO), nunca no chat e nunca em arquivo versionado — o `.plumb/` é commitado |

## Como propor

Proponha a **capacidade** quando não souber o produto, e deixe o usuário dizer
qual usa. A pergunta ("o projeto usa qual gestor?" — Jira / Linear / Monday /
Trello / outro) vai pela **ferramenta de perguntas** (texto numerado com a
recomendação na opção 1 quando não houver), não em texto solto.

```
Falta ler o card da tarefa — apareceu em PAY-142 e em fix-login, nas duas o
plano começou sem os critérios que já estavam escritos no ticket.
```

Com o produto conhecido, proponha direto, com o escopo e o custo:

```
Sugiro o MCP do Sentry (somente leitura) — nas duas últimas investigações o
erro real estava lá e trabalhamos por suposição. Pede um token de leitura, que
entra na config do MCP (não no repo).
```

## Depois de instalar (ou criar)

1. **Registre no cérebro** como nota markdown em `.plumb/knowledge/` (ex.:
   `.plumb/knowledge/stack.md` ou `.plumb/knowledge/<área>/`): o que o projeto
   usa e qual ferramenta cobre. É o que evita a próxima sessão perguntar de novo.
   Nada de segredo na nota — o `.plumb/` é commitado.
2. **Uma linha no `AGENTS.md`**, no grupo **Ferramentas**, dizendo **quando** usar
   — não o que é (`sentry` — erro em produção que o teste local não reproduz).
3. **Credencial** na config do próprio MCP (variável de ambiente / cofre do SO).
   Nunca peça o valor no chat nem o grave em arquivo versionado.

## Limites

- Nunca instale nem crie nada sem o "sim" do usuário: um MCP roda com as
  permissões da conta dele.
- Não acumule: cada ferramenta registrada custa contexto em toda sessão. Se duas
  cobrem o mesmo, fique com uma.
- MCP de terceiro sem fabricante por trás: diga que é de terceiro e deixe o
  usuário decidir. MCP criado sob medida: revise antes de ligar.
