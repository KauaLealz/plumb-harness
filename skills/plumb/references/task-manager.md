# Com um gestor de tarefas conectado

Jira, Linear, Monday, Trello, ClickUp, GitHub Issues: se houver um MCP de
tarefas disponível, ele é **a fonte de verdade do trabalho** — e o cérebro
nunca disputa esse papel com ele.

| Onde | Guarda | Vive enquanto |
|---|---|---|
| **Gestor de tarefas** | o **quê** e o **status** — compartilhado com gente | o card existir |
| **Cérebro** | o **porquê** e o **como** — regra, decisão, padrão, procedimento | para sempre |
| **Spec** | a ponte entre os dois | a mudança estiver viva |

Nos dois sentidos: o cérebro **nunca** guarda status, andamento ou id de tarefa
fora da spec (isso morre com o card); o gestor **nunca** guarda regra durável (ela
morreria junto com o card fechado).

| Passo | O que muda |
|---|---|
| **rota / ask** | Pedido é um id (`PAY-142`)? Busque o card: a descrição e os critérios dele são a entrada — não pergunte o que já está escrito lá |
| **grill** | O card responde antes do usuário: só pergunte o que o card não diz, ou o que ele contradiz no `.plumb/knowledge` |
| **spec** | O cabeçalho da spec **referencia** o card (linha `Card:`), não copia a descrição. Resultados esperados saem dos critérios do card quando existem |
| **plumb-code** | Ao começar, status do card → em andamento; ao fechar a última fase de código, → pronto. **Num lugar só** |
| **ship** | Comente no card com a evidência e o link do commit ou PR |

Sem gestor conectado, o status vive na spec (`.plumb/work/<id>.md`) e na lista de
tarefas nativa. Se o usuário fala de card e não há ferramenta que o alcance:
`plumb-find-mcps` (recomendação pela ferramenta de perguntas, nada instalado sem o "sim").
