# Sinais de retroalimentação

Anote cada sinal em uma linha na seção `## Retro` da spec (no `content` do item
`spec/<id>`; junte as linhas e grave com a próxima atualização da spec), na hora:
`- <tipo>: <o que aconteceu> — <evidência>`. Custa uma linha e alimenta a fase
Aprender e o `/plumb-dream`.

| Tipo | Quando | O que fazer |
|---|---|---|
| `regra` | O usuário enuncia uma diretriz ("sempre…", "nunca…", "aqui a gente…", "a partir de agora…") | **Na hora:** grave pelo `brain.md` e confirme em uma linha |
| `decisão` | O usuário decide algo com um porquê que vale além desta mudança | Anotar |
| `correção` | O usuário corrige algo que você fez | Anotar |
| `rejeição` | A spec é rejeitada por um motivo que vale além desta mudança | Anotar |
| `travamento` | A regra do travamento disparou, ou algo não óbvio custou tempo | Anotar, com o sintoma e o que destravou |
| `retrabalho` | Uma correção pós-revisão nasceu de algo que um resultado esperado ou checklist teria pego | Anotar |
| `procedimento` | Você executou passos que vão se repetir (migration, endpoint novo, release) | Anotar |
| `padrão novo` | Esta mudança fez algo pela primeira vez no projeto (primeiro endpoint, migration, componente, job, tratamento de erro) | Anotar, com o arquivo que virou modelo |
| `fato velho` | Um comando do `AGENTS.md` ou um item do cérebro não vale mais | Anotar |
| `lacuna` | Faltou uma capacidade (estado do banco, verificar UI, ler o ticket) | Veja "Ferramenta que falta" abaixo |

## Tratar os sinais (fase Aprender)

Antes de fechar a spec, trate os sinais da Retro ainda não tratados — **você**, inline,
pelo passo a passo da fase 7 do `SKILL.md`. Traduzindo cada tipo:

| Sinal | Vira |
|---|---|
| `regra`, `correção` e `rejeição` repetidas | `rule/*` (o subtipo que serve), com `scope_paths` estreito e o porquê |
| `decisão` | `rule/decision` com `## Por quê` e `## Alternativa descartada`; `source` = a spec |
| `procedimento` | `howto/*` com os comandos exatos |
| `padrão novo` | `rule/pattern` com `Arquivo-modelo:` apontando o arquivo criado |
| `travamento` resolvido | `howto/troubleshoot`: sintoma, causa, solução |
| `fato velho` | corrige o `AGENTS.md` (um comando que mudou) ou o item (`outdated`, ou regrava pela mesma key) |
| `lacuna` | nada no cérebro; entra na tabela abaixo |

- Antes de gravar, o item já existe e foi ignorado? O problema é de aderência
  (falta o porquê, um exemplo, `keywords` ou `scope_paths`), não de regra faltando:
  reforce o item.
- O que o usuário ditou grava; o que você inferiu pede o "sim" (`brain.md` §9).
- Erro de gravação: corrija a entrada que o erro aponta e grave de novo.
- Feche a Retro com `Números:` (formato no modelo da spec).

## Ferramenta que falta

Conhecimento resolve o que o agente **sabe**; ferramenta resolve o que ele
**alcança**. Uma lacuna que a sessão mostrou vira recomendação de MCP, skill ou
consulta de documentação, **com o sinal citado** (o que faltou, em que momento,
o que foi improvisado no lugar). A evidência exigida é a que a própria sessão
mostra: o pedido do usuário já é o pedido de olhar, e nada se instala sem o
"sim". Uma suposição sem sinal observado não vira recomendação.

| Sinal observado | Fase | O que resolveria |
|---|---|---|
| "o card diz…", "abre o ticket" — e ninguém conseguiu ler o card | Entender | MCP de tarefas (Jira, Linear, Monday, Trello) |
| Pediram para seguir um design e só havia descrição por escrito | Entender · Construir | MCP de design (Figma) |
| Precisou de dado real e só havia suposição sobre o schema | Entender · Provar | MCP do banco (somente leitura) |
| "em produção dá erro X" sem acesso ao erro | Provar · investigação | MCP de observabilidade (Sentry, Datadog, Grafana) |
| Teste de interface feito só por leitura de código | Provar | MCP de navegador |
| Deploy ou variável de ambiente conferida à mão | Entregar | MCP da plataforma (Railway, Vercel, AWS) |
| Biblioteca ou API usada de memória, sem consultar a doc | Construir | Consulta de documentação (`plumb-find-docs`) |
| Uma competência inteira improvisada (mesmo uma vez, com o improviso descrito) | qualquer | Skill (`plumb-find-skills`) |

Proponha a **capacidade**, não o produto, quando não souber qual o projeto usa
("falta ler o card da tarefa — o projeto usa qual gestor?"). Registre o que o
projeto usa em `context/stack`, para a próxima sessão não perguntar de novo.
A recomendação vai ao usuário pela ferramenta de perguntas (múltipla escolha,
recomendação primeiro, com "agora não"; uma recusa fica registrada em
`context/stack`). Depois da busca (`plumb-find-mcps`, `plumb-find-skills`),
nada se instala sem o "sim".
