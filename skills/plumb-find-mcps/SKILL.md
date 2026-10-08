---
name: plumb-find-mcps
description: >-
  Encontra e propõe servidores MCP quando falta ao agente *acesso* a um sistema
  externo — ler o card de uma tarefa, consultar o banco, ver o erro que aconteceu
  em produção, olhar o design, conferir o deploy. Use quando a mesma falta de
  acesso aparecer no trabalho, quando o usuário mencionar uma ferramenta que você
  não alcança, ou no setup de um projeto.
---

# Encontrar MCPs

Skill é o que o agente **sabe fazer**; MCP é o que ele **alcança**. Quando o
trabalho trava porque uma informação existe mas está fora do alcance — o card
no Jira, a linha no banco, o erro no Sentry — a resposta é uma ferramenta, não
mais instrução.

## Quando usar

- A mesma falta de acesso apareceu **duas vezes** (o fechamento da mudança e o `/plumb-dream` detectam isso).
- O usuário menciona um sistema que você não consegue consultar ("o card diz…",
  "em produção dá erro X", "segue o Figma").
- No `plumb-setup`, ao levantar a stack do projeto.
- O planejador devolveu "Ferramenta que falta".

**Não use** para o que não muda o trabalho: se o agente nunca vai precisar
daquele acesso em nenhuma fase, a ferramenta só custa contexto.

## O que procurar, por fase do trabalho

| Falta | Fase | Categoria de MCP |
|---|---|---|
| Ler o card, mudar status, comentar | Entender · Entregar | tarefas (Jira, Linear, Monday, Trello, ClickUp, Asana) |
| Ver o design antes de construir tela | Entender · Construir | design (Figma) |
| Conferir schema, olhar dado real | Entender · Provar | banco **somente leitura** (Postgres, MySQL, Mongo) |
| Ver o erro que o usuário teve | Provar · investigação | observabilidade (Sentry, Datadog, Grafana, New Relic) |
| Exercitar a interface de verdade | Provar | navegador |
| Conferir deploy, variável de ambiente, log | Entregar | plataforma (Railway, Vercel, AWS, Fly) |
| Ler a spec escrita fora do código | Entender | documentação (Notion, Confluence) |
| API de biblioteca atual | Entender · Construir | já resolvido: skill `plumb-find-docs` |

## Como procurar

1. **Oficial primeiro.** Quase todo produto popular tem um MCP oficial ou
   mantido pelo próprio fabricante. Procure por `<produto> MCP server` e
   prefira o do fabricante ao de terceiro.
2. **Registro.** O catálogo oficial do Model Context Protocol e as listas da
   comunidade (`modelcontextprotocol/servers`) cobrem a maioria dos casos.
3. **Já instalado?** Antes de propor, confira o que já existe nesta máquina —
   a ferramenta pode estar lá e ninguém saber (`claude mcp list`).

## Antes de propor, responda três coisas

| Pergunta | Por que importa |
|---|---|
| **Qual fase isso destrava?** | Se não destrava nenhuma, não proponha |
| **Precisa escrever?** | Prefira somente leitura. Banco e produção, **sempre** somente leitura |
| **Que credencial pede?** | Token entra como `secret` no cérebro (item vazio, o usuário preenche na UI) — nunca no chat, nunca em arquivo versionado |

## Como propor

Proponha a **capacidade** quando não souber o produto, e deixe o usuário dizer
qual usa:

```
Falta ler o card da tarefa — apareceu em PAY-142 e em fix-login, nas duas o
plano começou sem os critérios que já estavam escritos no ticket.
O projeto usa qual gestor? (Jira / Linear / Monday / Trello / outro)
```

Com o produto conhecido, proponha direto, com o escopo e o custo:

```
Sugiro o MCP do Sentry (somente leitura) — nas duas últimas investigações o
erro real estava lá e trabalhamos por suposição.
Pede um token de leitura, que entra como segredo no cérebro.
```

## Depois de instalar

1. Registre no cérebro, em `context/stack` do project: o que o projeto usa e
   qual ferramenta cobre. É o que evita a próxima sessão perguntar de novo.
2. Acrescente uma linha no grupo **Ferramentas** do `AGENTS.md`, dizendo
   **quando** usar — não o que é. (`sentry` — erro em produção que o teste
   local não reproduz.)
3. Credencial: `item_save` de um `secret` vazio e passe o `fill_url` ao
   usuário.

## Limites

- Nunca instale nada sem o "sim" do usuário: um MCP roda com as permissões da
  conta dele.
- Não acumule: cada ferramenta registrada custa contexto em toda sessão. Se
  duas cobrem o mesmo, fique com uma.
- MCP de terceiro sem fabricante por trás: diga que é de terceiro e deixe o
  usuário decidir.
