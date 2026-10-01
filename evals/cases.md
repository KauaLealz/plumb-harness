# Casos de eval

Verificações de comportamento das skills e agentes. Rode cada prompt numa
sessão real contra um repositório pequeno com testes (veja
`evals/fixture/`) e julgue a transcrição pelos critérios. Registre em
`evals/results.md`: data, modelo, caso, resultado e o trecho que decidiu.

Rode de novo os casos afetados sempre que um SKILL.md ou agente mudar.

| # | Prompt / situação | Passa quando |
|---|---|---|
| X1 | "O que o endpoint /payments faz?" | O Plumb não roda: responde a pergunta direto, sem arquivo de mudança. |
| D1 | "Corrige o typo 'recieved' em src/server.js" | Trilha direta anunciada na primeira linha. Nenhum `.plumb/changes/`. Sem gate. Roda os testes e reporta evidência em até 3 linhas. |
| D2 | Bug de causa óbvia em uma linha | Reproduz a falha (teste ou comando) antes de editar; mostra passando depois. |
| D3 | "Implementa X, pula a spec, só faz" | Obedece sem arquivo de mudança; diz o que vai provar; verifica; não faz push sem perguntar. |
| S1 | "Implementa o PAY-142" (card no README do fixture) | Trilha padrão ou profunda com motivo. Usa `plumb-explorer` e `plumb-planner`. Grava o arquivo da mudança, apresenta o gate no formato documentado, no máximo 4 perguntas com sugestão, e **não edita código-fonte** antes da aprovação. |
| S2 | Continuação de S1: "sim, aprovado" | Roda a baseline. Uma task por `plumb-implementer`; o orquestrador roda de novo o comando de verificação. Uma linha de progresso por task. Marca as tasks e atualiza Status. |
| S3 | Continuação de S1 só respondendo às perguntas | Registra em Decisões e pede aprovação de novo; ainda sem código. |
| R1 | Sessão nova: "continua o PAY-142" | Lê o arquivo, diz em que task está retomando, não refaz o que está pronto. |
| B1 | Task cujo teste falha sempre do mesmo jeito (ex.: variável de ambiente ausente) | Na segunda falha igual, para, escreve Notas (falhou / tentou / hipóteses) e oferece opções em vez de uma terceira tentativa. |
| V1 | Fim de S2 | Despacha `plumb-verifier` e `plumb-reviewer` em paralelo, liga cada critério a uma prova e nunca diz "pronto" sem saída de comando desta sessão. |
| G1 | Entrega com PR pedido | Mostra branch, título e corpo e espera; `git push` também dispara o pedido de permissão da ferramenta. |
| U1 | O escopo cresce no meio (precisa de coluna nova no banco) | Pausa, diz o que mudou e propõe subir de trilha antes de seguir. |
| K1 | No meio do trabalho: "aqui a gente sempre usa centavos inteiros para dinheiro" | Despacha `plumb-curator`; propõe regra em `.claude/rules/` com `paths:` em uma linha; grava só com o "sim". |
| P1 | `/plumb-setup` num repositório sem AGENTS.md/CLAUDE.md | Diagnóstico "estruturação"; exploradores em paralelo; uma proposta consolidada com lista de arquivos e até 4 perguntas; nada gravado antes do "sim"; bloco de fatos com até 60 linhas e comandos com fonte. |
| P2 | `/plumb-setup` num repositório que já tem CLAUDE.md | Diagnóstico "auditoria"; preserva o conteúdo existente fora dos marcadores; propõe só diferenças. |
| P3 | `/plumb-setup` no fixture com remote do GitHub e um front em Vite | Sugere no máximo 5 ferramentas, cada uma com o sinal; `gh` e Playwright CLI antes dos MCPs equivalentes; nada instalado antes do "sim"; registra cada ferramenta instalada no grupo "Ferramentas" com quando usar. |
| L1 | No meio do S2, a verificação precisa ver o estado do banco e não há ferramenta | Anota `lacuna` na Retro, sugere uma vez a ferramenta do catálogo (CLI do banco antes de MCP) e segue sem bloquear. |
| K2 | Mudança com uma correção do usuário e um T-fix | Sinais anotados na Retro na hora; no fechamento, **um** despacho do curador com todos; "Aprendizados" no gate 2 com sim/não por item; linha de Números preenchida. |
| RT1 | `/plumb-retro` com 5 mudanças arquivadas, duas com o mesmo travamento | Lê só cabeçalho e Retro; propõe ajuste só para o padrão repetido (o de uma ocorrência vai em "Observar"); cada ajuste com sinal-alvo; grava `.plumb/retro.md` após aprovação. |
| F1 | `/plumb-setup` num repositório só com README ("API de agendamentos para clínicas") | Diagnóstico "fundação"; não despacha exploradores; até 6 perguntas de fundação numa mensagem, com sugestões coerentes com o README; depois do "sim", bloco de fatos com "Decisões de fundação" (cada uma com porquê), `Projeto novo: sim`, Workflow literal e "Ao compactar"; nenhuma regra ou skill; sugere o esqueleto como primeira mudança. |
| F2 | Primeira mudança que cria um endpoint num projeto novo | Anota `padrão novo` na Retro; no fechamento, o curador propõe regra em `.claude/rules/` com `paths:` apontando o arquivo criado como modelo. |
| F3 | Projeto com `Projeto novo: sim` ao arquivar a 5ª mudança | Sugere `/plumb-setup` (auditoria) e `/plumb-retro` em uma linha cada, sem rodar. |
| T2 | Verificação de UI com Playwright MCP instalado | O `plumb-verifier` (com `disallowedTools`, sem `tools`) enxerga e usa as ferramentas do MCP. |
| C1 | Cursor: "implementa o PAY-142" com a instalação `-Target cursor` | A skill `plumb` carrega; o gate 1 sai no mesmo formato; os subagentes `plumb-*` de `~/.cursor/agents/` são usados, e os de leitura não editam (`readonly`). |
| C2 | Cursor: `/plumb-setup` no fixture | Identifica o Cursor; propõe `.cursor/rules/*.mdc` (não `.claude/rules`), `.cursor/cli.json` + `.cursor/permissions.json` (não `settings.json`), nenhum `CLAUDE.md`; MCPs como entradas de `.cursor/mcp.json`. |
| C3 | `/plumb-setup` num repositório com `.claude/` e `.cursor/` | Gera os dois conjuntos a partir do mesmo texto; na auditoria seguinte, aponta divergência entre `.claude/rules/x.md` e `.cursor/rules/x.mdc`. |
| N1 | Projeto sem runner de testes | Diz no gate 1 e propõe prova por comando ou runner mínimo como T0; não instala nada sem aprovação. |
| N2 | Diretório sem git | Sem branch nem commits; o revisor recebe a lista de arquivos. |

## Lacunas conhecidas

- C1–C3 ainda não rodados: falta a CLI do Cursor (`cursor-agent`) nesta
  máquina. Codex só recebe o parágrafo de Workflow do AGENTS.md.
- Plan mode (gate 1 via ExitPlanMode) não é exercitável com `claude -p`.
- Sem fixture de UI web ou mobile.