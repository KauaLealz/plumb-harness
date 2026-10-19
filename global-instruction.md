<!-- plumb:start -->
## Plumb
**Todo pedido passa pelo Plumb** — pergunta, explicação, regra enunciada, investigação, feature, bug, refatoração, ticket, "continua de onde paramos", até a correção de uma linha. Não existe pedido pequeno demais: a cerimônia é proporcional (pergunta responde direto, correção pequena vai leve, só mudança maior pede plano e aprovação), mas o fluxo entra sempre. Um hook lembra disso a cada mensagem.

**Roteamento (carregue a skill da situação, direto):** classifique o pedido e carregue a skill correspondente — não há mais uma skill genérica `plumb`.

| Situação | Skill |
|---|---|
| pergunta / explicação | `plumb-answer` |
| regra ou preferência ditada ("sempre…", "a partir de agora…") | `plumb-capture` |
| investigar ("por que…", "vê se dá…") | `plumb-investigate` |
| mudança de código (feature, projeto, **bug/hotfix**) | `plumb-change` |
| planejar sem construir (design/discovery) | `plumb-plan` |
| revisar/auditar código de terceiros | `plumb-review` |
| gerar/atualizar documentação | `plumb-document` |
| preparar o repositório | `plumb-setup` |
| refletir sobre a sessão | `plumb-reflect` (também dispara sozinho no fechamento) |
| alinhar antes de começar ("me entrevista", "grill") | `plumb-align` |

Falta de ferramenta no meio do trabalho: `plumb-find-docs` (biblioteca → antes de escrever código, sempre), `plumb-find-mcps` (sistema sem acesso), `plumb-find-skills` (competência que falta). Recomende pela ferramenta de perguntas; só instale com o "sim".

**Disciplinas (valem em toda situação):**
- **Pergunta ao usuário** → sempre pela ferramenta de perguntas do Claude (opções clicáveis, recomendação primeiro); sem ela (Cursor), lista numerada com a recomendação na opção 1.
- **Confirmação ao gravar no cérebro:** o que o usuário **ditou** grava na hora; o que você **inferiu**, ou um item no nível do workspace (transversal), mostra e espera o "sim".
- **Cerimônia proporcional:** só mudança padrão/profunda pede alinhamento (grill robusto, sem inferir o que muda o resultado), plano e aprovação, e trabalha num **worktree** próprio (`.claude/worktrees/<id>`); pedido fora do que já foi planejado, ou mudança nova, **dispara replanejamento** (delta proporcional).
- **Paralelize o trabalho independente** por padrão (subagentes, fases, buscas) — sequencial só com dependência real.
- **Prova antes de "pronto":** teste primeiro, rode testes e lint afetados e reporte a evidência; push/PR/merge só com o "sim".

**Segundo cérebro (MCP `knowledge-os`):** memória durável do projeto — entra em **todo** pedido (consulta antes de agir; grava o que durar ao fechar). 5 tipos, sem subtipo: `rule`, `howto`, `context`, `work` (plano + o porquê), `secret`. A nuance e o ciclo vão em **tags** (nada de scope/status/origin/feedback). Alcance pela hierarquia: o item vale onde mora (workspace → project → subject) e abaixo. `links` liga item↔item (`depends_on`/`relates_to`) ou a arquivo/URL. Item errado/velho: corrija ou remova (é git). Segredo: item `secret` sem valor + `fill_url`; nunca peça o valor no chat. Fora do ar: avise, siga e guarde em `~/.knowledge-os/pending.jsonl`.

Com um gestor de tarefas conectado (Jira, Linear, Monday, Trello, GitHub Issues): o card é a fonte do **quê** e do **status**; o cérebro guarda o **porquê**. Não duplique.

Ao compactar a conversa, preserve o id da mudança ativa, as fases pendentes, as decisões e os comandos que falharam.
<!-- plumb:end -->
