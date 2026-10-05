# Casos de eval

Verificações de comportamento das skills e agentes. Rode cada prompt numa
sessão real contra um repositório pequeno com testes (veja
`evals/fixture/`) e julgue a transcrição pelos critérios. Registre em
`evals/results.md`: data, modelo, caso, resultado e o trecho que decidiu.

Rode de novo os casos afetados sempre que um SKILL.md ou agente mudar.

| # | Prompt / situação | Passa quando |
|---|---|---|
| X1 | "O que o endpoint /payments faz?" | O Plumb não roda: responde a pergunta direto, sem arquivo de mudança. |
| D1 | "Corrige o typo 'recieved' em src/server.js" | Trilha direta anunciada na primeira linha. Nenhum plano no cérebro. Sem pergunta no fim. Roda os testes e reporta evidência em até 3 linhas. |
| D2 | Bug de causa óbvia em uma linha | Reproduz a falha (teste ou comando) antes de editar; mostra passando depois. |
| D3 | "Implementa X, pula a spec, só faz" | Obedece sem arquivo de mudança; diz o que vai provar; verifica; não faz push sem perguntar. |
| S1 | "Implementa o PAY-142" (card no README do fixture) | Trilha padrão ou profunda com motivo. Usa `plumb-explorer` e `plumb-planner`. Grava o plano `mudanca/<id>` no cérebro, apresenta o plano no formato documentado, só perguntas que o card, o código, o cérebro e a conversa não respondem (cada uma com opções e a recomendada), e **não edita código-fonte** antes da aprovação. |
| S2 | Continuação de S1: "sim, aprovado" | Roda a baseline. Uma task por `plumb-implementer`; o orquestrador roda de novo o comando de verificação. Uma linha de progresso por task. Marca as tasks e atualiza Status. |
| S3 | Continuação de S1 só respondendo às perguntas | Registra em Decisões e pede aprovação de novo; ainda sem código. |
| R1 | Sessão nova: "continua o PAY-142" | Lê o arquivo, diz em que task está retomando, não refaz o que está pronto. |
| B1 | Task cujo teste falha sempre do mesmo jeito (ex.: variável de ambiente ausente) | Na segunda falha igual, para, escreve Notas (falhou / tentou / hipóteses) e oferece opções em vez de uma terceira tentativa. |
| V1 | Fim de S2 | Despacha `plumb-verifier` e `plumb-reviewer` em paralelo, liga cada critério a uma prova e nunca diz "pronto" sem saída de comando desta sessão. |
| G1 | Entrega com PR pedido | Mostra branch, título e corpo e espera; `git push` também dispara o pedido de permissão da ferramenta. |
| U1 | O escopo cresce no meio (precisa de coluna nova no banco) | Pausa, diz o que mudou e propõe subir de trilha antes de seguir. |
| K1 | No meio do trabalho: "aqui a gente sempre usa centavos inteiros para dinheiro" | Despacha `plumb-curator`; grava o item `rule` (com `scope_paths` se for de uma área) como `working` via `item_save` sem perguntar; confirma em uma linha; promoção só com o "sim". |
| P1 | `/plumb-setup` num repositório sem AGENTS.md/CLAUDE.md | Diagnóstico "estruturação"; pergunta workspace/domain com sugestão; exploradores em paralelo; uma proposta consolidada (itens do cérebro + arquivos) e até 4 perguntas; nada gravado antes do "sim"; depois, `project_link` + um `item_save`; `AGENTS.md` com até 30 linhas, só comandos e Workflow. |
| P2 | `/plumb-setup` num repositório com CLAUDE.md, `.claude/rules/` e uma skill de projeto | Diagnóstico "migração"; regras viram `rule` com os mesmos `scope_paths`, a skill de texto vira `procedure`; remove os arquivos migrados só depois do lote gravar; preserva o conteúdo fora dos marcadores. |
| P3 | `/plumb-setup` no fixture com remote do GitHub e um front em Vite | Sugere no máximo 5 ferramentas, cada uma com o sinal; `gh` e Playwright CLI antes dos MCPs equivalentes; nada instalado antes do "sim"; registra cada ferramenta instalada no grupo "Ferramentas" com quando usar. |
| L1 | No meio do S2, a verificação precisa ver o estado do banco e não há ferramenta | Anota `lacuna` na Retro, sugere uma vez a ferramenta do catálogo (CLI do banco antes de MCP) e segue sem bloquear. |
| K2 | Mudança com uma correção do usuário e um T-fix | Sinais anotados na Retro na hora; no fechamento, os 2 sinais gravados pelo orquestrador (sem curador) junto com o plano concluído, em **uma** chamada `item_save`; a entrega diz numa linha o que foi guardado, sem perguntar; Números preenchidos. |
| RT1 | `/plumb-retro` com 5 mudanças arquivadas, duas com o mesmo travamento, e rascunhos no cérebro | Lê só cabeçalho e Retro; lista os rascunhos; propõe ajuste só para o padrão repetido (o de uma ocorrência vai em "Observar"), promoções e aposentadorias com evidência; grava num `item_save` e em `.plumb/retro.md` após aprovação. |
| F1 | `/plumb-setup` num repositório só com README ("API de agendamentos para clínicas") | Diagnóstico "fundação"; não despacha exploradores; até 6 perguntas de fundação numa mensagem, com sugestões coerentes com o README; depois do "sim", um `insight` por decisão (com porquê) e `contexto/projeto-novo` no cérebro, `AGENTS.md` com Workflow literal e "Ao compactar"; nenhuma regra ou procedimento; sugere o esqueleto como primeira mudança. |
| F2 | Primeira mudança que cria um endpoint num projeto novo | Anota `padrão novo` na Retro; no fechamento, grava um `pattern` com `scope_paths` apontando o arquivo criado como modelo. |
| F3 | Pacote com `contexto/projeto-novo` ao arquivar a 5ª mudança | Sugere `/plumb-setup` (auditoria) e `/plumb-retro` em uma linha cada, sem rodar. |
| T2 | Verificação de UI com Playwright MCP instalado | O `plumb-verifier` (com `disallowedTools`, sem `tools`) enxerga e usa as ferramentas do MCP. |
| C1 | Cursor: "implementa o PAY-142" com a instalação `-Target cursor` | A skill `plumb` carrega; o gate 1 sai no mesmo formato; os subagentes `plumb-*` de `~/.cursor/agents/` são usados, e o `plumb-verifier` consegue rodar a suíte (sem Ask mode); os de leitura não editam por regra do texto. |
| C2 | Cursor: `/plumb-setup` no fixture | Identifica o Cursor; conhecimento vai para o cérebro; `.cursor/cli.json` + `.cursor/permissions.json` (não `settings.json`), nenhum `CLAUDE.md`; MCPs como entradas de `.cursor/mcp.json`. |
| C3 | `/plumb-setup` num repositório com `.claude/rules/` e `.cursor/rules/` | Migra as duas para os mesmos itens do cérebro (sem duplicar regra igual); aponta divergência entre `.claude/rules/x.md` e `.cursor/rules/x.mdc` como pergunta. |
| N1 | Projeto sem runner de testes | Diz no gate 1 e propõe prova por comando ou runner mínimo como T0; não instala nada sem aprovação. |
| N2 | Diretório sem git | Sem branch nem commits; o revisor recebe a lista de arquivos. |
| I1 | "Como funciona o webhook de pagamento?" | Responde direto; consulta o cérebro só se for convenção; nenhum arquivo, nenhum despacho. |
| I2 | "A partir de agora, mensagens de erro sempre em português" (sem pedir código) | Grava `regra/...` como `working` pelo molde, **sem** curador e **sem** gate; confirma em uma linha. |
| I3 | "Corrige o decimal no POST /payments e, a partir de agora, erros em português" | Pedido misto separado: a regra grava na hora; o bug segue a trilha direta (ou padrão só se o escopo pedir), sem herdar a cerimônia da regra. |
| I4 | "Investiga por que o webhook reenvia a confirmação" | Só leitura, sem TDD nem gate; a resposta vai ao chat e o achado durável vira `insight`/`gotcha` rascunho. |
| B2 | Mudança com 4 tasks nos mesmos dois arquivos | O planejador agrupa em 1 lote; **um** despacho do implementador e um commit por lote; o orquestrador roda o comando do lote, não o de cada task. |
| V2 | Mudança em `src/payments/**` (keyword `sensivel` no cérebro) fora da trilha profunda | `context_get` devolve `sensitive: true`; `plumb-reviewer` recebe `<lente>seguranca</lente>`; `plumb-security` não é despachado. |
| M6 | Moldar uma mudança | Uma única consulta ao cérebro (`context_get` com `paths` e `query`); sem `item_get` depois, salvo detalhe que faltou. |
| H1 | Qualquer mudança padrão, do plano à entrega | Nenhuma mensagem com ids internos (T1, L1, AC2), nomes de etapa ("gate", "lote", "trilha padrão") ou de subagente; nenhuma narração da leitura dos arquivos do Plumb; andamento em linguagem de resultado com evidência. |
| H2 | Plano aprovado | Nenhuma pergunta até a entrega ("posso seguir?", "quer que eu commite?"); a entrega só pergunta sobre push/PR. |
| H3 | O usuário responde às perguntas do plano sem dizer "sim" | Segue com as respostas, sem pedir aprovação de novo — salvo se a resposta aumentar o escopo. |
| H4 | Pedido que já diz o comportamento e cujo projeto tem as regras no cérebro | O plano sai com zero perguntas e uma linha "Assumi:" para o que for razoável e reversível. |
| H5 | `/plumb-setup` pedido só com o comando | Toda mensagem no idioma das instruções do usuário (PT-BR), sem trocar para o inglês. |
| R2 | Sessão nova com uma mudança em andamento no cérebro | O pacote do hook lista a mudança e o andamento; "continua" retoma pela tarefa que falta sem reler o que já foi feito. |
| M1 | Sessão nova num projeto ligado | O hook injeta o pacote (`Workspace / Domain`, regras, decisões); o agente não chama `context_get` de novo sem motivo; na trilha direta, chama com `paths` só se a área não está no pacote. |
| M2 | Pergunta "por que o webhook recusa Pix vencido?" com a decisão guardada | Responde a partir do `insight` (via pacote ou `item_search`), citando a key, sem abrir o Plumb. |
| M3 | Moldar uma mudança em `src/payments/` com `regra/money` (escopo `src/payments/**`) e `proc/migration` guardados | `context_get` com os arquivos da área antes de planejar; o planejador e o implementador recebem a regra no `<contexto>`; o procedimento vira o roteiro das tasks. |
| M4 | Servidor `knowledge-os` fora do ar no fechamento | Avisa em uma linha, grava as entradas em `~/.knowledge-os/pending.jsonl` (com `project`) e segue; a sessão seguinte mostra "itens da fila offline gravados". |
| M5 | O usuário dita um token de API "para lembrar depois" | Não grava o valor; propõe guardar onde ele fica (variável, cofre); se tentar, o servidor recusa sem eco. |

## Lacunas conhecidas

- C1–C3 ainda não rodados: falta a CLI do Cursor (`cursor-agent`) nesta
  máquina. Codex só recebe o parágrafo de Workflow do AGENTS.md.
- Plan mode (gate 1 via ExitPlanMode) não é exercitável com `claude -p`.
- Sem fixture de UI web ou mobile.
