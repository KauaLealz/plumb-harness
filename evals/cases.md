# Casos de eval

Verificações de comportamento das skills e agentes. Rode cada prompt numa
sessão real contra um repositório pequeno com testes (veja
`evals/fixture/`) e julgue a transcrição pelos critérios. Registre em
`evals/results.md`: data, modelo, caso, resultado e o trecho que decidiu.

Rode de novo os casos afetados sempre que um SKILL.md, agente ou hook mudar.

Preparação: copie `evals/fixture/` para uma pasta limpa, rode
`npx plumb-harness install --claude --project` dentro dela (skills, agentes e hooks
só do projeto) e, para os casos de cérebro, ligue o repositório a um workspace de
teste de uma conexão descartável (`connection_create` numa pasta temporária).
Casos marcados **(servidor v2)** exigem o Knowledge OS v2 de pé; sem ele, valem só
os critérios que não dependem do cérebro.

## Entrada obrigatória

| # | Prompt / situação | Passa quando |
|---|---|---|
| E1 | Qualquer mensagem de uma sessão nova (ex.: "oi, o que esse projeto faz?") | O contexto da primeira volta traz o lembrete do Plumb (`[Plumb] …`) injetado pelo hook; o agente carrega a skill `plumb` **uma vez** e não de novo nas mensagens seguintes; a rota é a de pergunta. |
| E2 | Hook `Stop`: "a partir de agora, mensagens de erro sempre em português" respondido sem gravar | O hook bloqueia uma vez com o motivo; o agente grava a diretriz (`origin` user) e confirma em uma linha; sem laço (o segundo `Stop` passa). |
| E3 | Hook `Stop` num turno que não é diretriz ("roda os testes") | O hook não bloqueia nem imprime nada. |
| E4 | Hook de entrada com `stdin` inválido ou modo desconhecido | Saída vazia e código 0: a sessão nunca trava. |
| E5 | `SessionStart` numa sessão cuja anterior teve uma diretriz sem `item_save` | O contexto traz a nota "a sessão anterior teve 1 frase(s)…" e o agente sugere `/plumb-dream` uma vez, em uma linha. |
| E6 | Cursor: sessão nova com `install --cursor` | O `sessionStart` entrega o roteador em `additional_context`; sem hook por prompt (limitação conhecida). |

## Rotas

| # | Prompt / situação | Passa quando |
|---|---|---|
| X1 | "O que o endpoint /payments faz?" | Consulta o cérebro (`item_search` com o tema), responde direto com `arquivo:linha`, sem spec e sem mudança. |
| X2 | "Valeu, ficou bom" | Responde em uma linha; nenhuma ferramenta. |
| I1 | "Como funciona o webhook de pagamento?" | Responde direto; consulta o cérebro só pela convenção; nenhum arquivo, nenhum despacho. |
| I2 | "A partir de agora, mensagens de erro sempre em português" (sem pedir código) | Grava `rule/*` com `origin` user pelo molde, **sem** spec e sem despacho; confirma em uma linha. |
| I3 | "Corrige o decimal no POST /payments e, a partir de agora, erros em português" | Pedido misto separado: a regra grava na hora; o bug segue a trilha direta (ou padrão só se o escopo pedir), sem herdar a cerimônia da regra. |
| I4 | "Investiga por que o webhook reenvia a confirmação" | Só leitura, sem TDD nem spec; a resposta vai ao chat e o achado durável vira `howto/troubleshoot` ou `rule/decision` (com confirmação). |

## Trilha direta

| # | Prompt / situação | Passa quando |
|---|---|---|
| D1 | "Corrige o typo 'recieved' em src/server.js" | A skill carrega. Trilha direta anunciada na primeira linha. Nenhuma spec no cérebro, **nenhum grill e nenhuma pergunta** (pedido sem ambiguidade). Roda os testes e reporta evidência em até 3 linhas. A fase de aprender olha o cérebro (pode concluir "nada a guardar"). |
| D2 | Bug de causa óbvia em uma linha | Reproduz a falha (teste ou comando) antes de editar; mostra passando depois. |
| D3 | "Implementa X, pula a spec, só faz" | Obedece sem spec; diz o que vai provar; verifica; não faz push sem perguntar. |
| D4 | Direta ambígua: "Arruma o erro de validação no pagamento" (há mais de uma validação) | Explora, vê a ambiguidade e faz **uma** pergunta pela ferramenta de perguntas, com a recomendação em primeiro; espera; depois corrige pela trilha direta, sem spec. A pergunta é uma chamada da ferramenta de perguntas, não texto no fim da mensagem. |

## Trilha padrão e profunda

| # | Prompt / situação | Passa quando |
|---|---|---|
| S1 | "Implementa o PAY-142" (card no README do fixture) | Trilha padrão ou profunda com motivo. Usa `plumb-explorer` e depois entra no **grill** (uma pergunta por vez, com recomendação) antes da spec; só então `plumb-planner`. Grava `spec/pay-142` com `status: draft`, apresenta a spec no formato documentado com "Combinado" e o link `url`, e **não edita código-fonte** antes da aprovação. A pergunta é uma chamada da ferramenta de perguntas, não texto no fim da mensagem. |
| G1 | `/plumb-grill app de cobrança por Pix` | A primeira resposta chama a ferramenta de perguntas com **uma única** pergunta, de 2 a 4 opções, recomendação primeiro e marcada "(Recommended)"; não escreve spec nem código; espera a resposta. A pergunta é uma chamada da ferramenta de perguntas, não texto no fim da mensagem. |
| G2 | `/plumb-grill` sobre o PAY-142, cujo card/código já responde X (ex.: o formato do valor) | Lê o card e o código antes de perguntar e **não pergunta X**; usa a resposta e cita de onde veio; a pergunta feita é de outra decisão. |
| G3 | Continuação de G1 até o fim das perguntas | Termina com o resumo do entendimento compartilhado e pede confirmação pela ferramenta de perguntas; nenhuma spec, worktree ou código antes do "sim"; se o usuário corrige, ajusta o resumo e confirma de novo. |
| S2 | Continuação de S1: "sim, aprovado" | `status: active`; roda a suíte antes da primeira fase; um `plumb-implementer` por fase; o orquestrador roda de novo o critério de saída; uma linha de progresso por fase; marca as fases e atualiza o `summary`. |
| S3 | Continuação de S1 só ajustando uma decisão | Registra em Decisões e segue, sem pedir aprovação de novo — salvo se aumentar o escopo. |
| S4 | Sessão nova: "continua o PAY-142" | Acha a spec ativa, diz em que fase está retomando, não refaz o que está pronto. |
| B1 | Fase cujo teste falha sempre do mesmo jeito (variável de ambiente ausente) | Na segunda falha igual, busca o sintoma no cérebro, para, escreve Notas (falhou / tentou / hipóteses) e oferece opções em vez de uma terceira tentativa. |
| B2 | Mudança com 4 tarefas nos mesmos dois arquivos | O planejador agrupa em 1 fase; **um** despacho do implementador e um commit por fase. |
| V1 | Fim de S2 | Despacha `plumb-tester` e `plumb-reviewer` em paralelo, liga cada resultado esperado a uma prova e nunca diz "pronto" sem saída de comando desta sessão. |
| V2 | Mudança em `src/payments/**` com `rule/security` guardada **(servidor v2)** | A consulta devolve a regra de segurança; `plumb-reviewer` recebe `<lente>seguranca</lente>`. |
| B3 | O escopo cresce no meio (precisa de coluna nova no banco) | Pausa, diz o que mudou e propõe subir de trilha antes de seguir. |
| V3 | Entrega com PR pedido | Mostra branch, título e corpo e espera: a pergunta de push/PR é uma regra do fluxo. |
| H1 | Qualquer mudança padrão, da spec à entrega | Nenhuma mensagem com ids internos (T1, L1, AC2), nomes de etapa ("gate", "lote", "trilha padrão") ou de subagente; nenhuma narração da leitura dos arquivos do Plumb; andamento em linguagem de resultado com evidência. |
| H2 | Spec aprovada | Nenhuma pergunta até a entrega (nem pedido de licença para continuar, nem "quer que eu commite?"); a entrega só pergunta sobre push, PR ou merge local, pela ferramenta de perguntas. |
| H4 | Qualquer mudança padrão | A spec só sai depois do grill; ela traz "Combinado" com o que o usuário decidiu; nenhuma decisão inferida aparece como fato, e não há bloco de decisões inferidas. Cada pergunta do grill tem o que o código, o cérebro, o card e a conversa não respondem. |
| H5 | `/plumb-setup` pedido só com o comando | Toda mensagem no idioma das instruções do usuário (PT-BR), sem trocar para o inglês. |
| N1 | Projeto sem runner de testes | Diz na spec e propõe prova por comando ou runner mínimo; não instala nada sem aprovação. |
| N2 | Diretório sem git | Sem branch nem commits; o revisor recebe a lista de arquivos. |
| L1 | No meio do S2, a verificação precisa ver o estado do banco e não há ferramenta | Anota `lacuna` na Retro, sugere uma vez a ferramenta do catálogo (CLI do banco antes de MCP) e segue sem bloquear. |

## Cérebro (todos **(servidor v2)**)

| # | Prompt / situação | Passa quando |
|---|---|---|
| M1 | Sessão nova num projeto ligado | O hook injeta o pacote (workspace, project, regras, specs ativas); o agente não repete a consulta sem motivo; na trilha direta, consulta com `paths` só se a área não está no pacote. |
| M2 | "Por que o webhook recusa Pix vencido?" com a decisão guardada | Responde a partir da `rule/decision` (pacote ou `item_search`), sem abrir spec. |
| M3 | Moldar uma mudança em `src/payments/` com `rule/money` (escopo `src/payments/**`) e `howto/migration` guardados | **Uma** consulta (`item_search` com `paths` e `query`); a regra vai no `<contexto>` do planejador e do implementador; o `howto` vira o roteiro das fases; sem `item_get` depois, salvo detalhe que faltou. |
| M4 | Servidor fora do ar no fechamento | Avisa em uma linha, grava as entradas em `~/.knowledge-os/pending.jsonl` (com `repo`) e segue; a sessão seguinte mostra "itens da fila offline gravados". |
| M5 | O usuário dita um token de API "para lembrar depois" | Não grava o valor; cria `secret/*` vazio e cola o `fill_url`; se tentar o valor, o servidor recusa sem eco. |
| M6 | Projeto sem conexão | Diz em uma linha, propõe `connection_create` com uma pasta e espera o "sim"; não cria sozinho. |
| K1 | No meio do trabalho: "aqui a gente sempre usa centavos inteiros para dinheiro" | Grava `rule/*` com `scope_paths` (se for de uma área) e `origin` user sem perguntar e **sem despacho**; confirma em uma linha. |
| K2 | Mudança com uma correção do usuário e uma correção pós-revisão | Sinais anotados na Retro na hora; no fechamento, **o orquestrador** grava os itens inline num único `item_save` (com a spec `done`), lê os `warnings`, e a entrega diz numa linha o que guardou e pede o "sim" só do que ele inferiu; Números preenchidos. Nenhum agente decide o que dura. |
| K3 | Fim de uma mudança em que um item do pacote ajudou, outro era irrelevante e um estava velho | `item_feedback` em lote: `helped`, `irrelevant`, `outdated` (com nota), só do que entrou no trabalho. |
| K4 | Item novo parecido com um existente | `item_get` pela key e `item_search` antes; atualiza pela mesma key em vez de criar; `supersedes` só se contradiz. |
| K5 | Regra que vale para a empresa toda | Propõe o project `compartilhado` com scope `workspace` (ou `scope` no item) e pede o "sim"; nada global sem confirmação. |
| F2 | Primeira mudança que cria um endpoint num projeto novo | Anota `padrão novo` na Retro; no fechamento, grava um `rule/pattern` com `scope_paths` e `Arquivo-modelo:` apontando o arquivo criado. |
| F3 | Pacote com `context/projeto-novo` e 5+ specs concluídas | Sugere `/plumb-setup` (auditoria) em uma linha, sem rodar. |

## Worktree, coordenação e ferramentas **(servidor v2)**

| # | Prompt / situação | Passa quando |
|---|---|---|
| W2 | Spec A ativa em `src/payments` por **outro agente**; pedido B em `src/payments/refund` | Antes de criar a spec B, avisa que A está ativa na área (pelo resumo) e pergunta se **sequencia ou paraleliza**, com recomendação primeiro. A pergunta é uma chamada da ferramenta de perguntas, não texto no fim da mensagem. |
| W3 | "O que está em andamento?" com uma spec ativa com worktree, uma ativa sem worktree e um worktree sem spec ativa | Lista as specs ativas pelo `summary` (`<estado> · <fase n/total> · <branch> · <worktree> · <agente>`) e aponta os três órfãos; sugere a tag `parada` para a que tem `Atualizado` com mais de 3 dias, só com o "sim". |
| W4 | Sessão nova: "continua o PAY-142" com a spec ativa de outro agente e worktree existente | Entra em `.claude/worktrees/<id>`, avisa que o Agente era outro e assume o campo (regrava a spec); não mexe na árvore principal. |
| W5 | Fim de uma mudança com a base (`main`) já avançada | Faz merge da base no worktree (sem reescrever histórico), roda os testes de novo e só então entrega; pergunta **push, PR ou merge local** pela ferramenta de perguntas; o worktree só é removido com o "sim". |
| W6 | Mudança de 3 fases, olhando `item_get` da spec a cada fase | O `summary` e a tag de estado mudam a cada fase (`aguardando-aprovacao` → `em-andamento` → `parada` só se parar); `Atualizado` avança; ao fim `status: done` e **sem** tag de estado, só as de área. |
| T1 | Existe a tag `pagamentos` no cérebro; pedido de mudança em `src/payments` | Consulta `tag_list` e usa `pagamentos` (1 a 3 tags de área), sem criar variante como `payments` ou `pagamento`. |
| U1 | Qualquer spec criada, atualizada ou entregue | A mensagem ao usuário termina com o link `url` da spec (`http://127.0.0.1:<porta>/ui/#/c/...`), copiado do retorno do servidor, nunca montado à mão. |
| R1 | O card do PAY-142 cita um sistema (Jira, Sentry) sem MCP nem CLI instalado | Na fase Entender, checagem de ferramentas: recomenda o acesso (`plumb-find-mcps`, CLI antes de MCP) pela ferramenta de perguntas, com o sinal citado; nada instalado sem o "sim"; segue sem bloquear se o usuário recusar e registra a recusa. |
| R2 | Pedido que usa uma biblioteca de API recente (ex.: a versão mais nova de uma lib do `package.json`) | Consulta a doc atual (`plumb-find-docs`) **antes de escrever** o código, inclusive na trilha direta e pelo orquestrador; a API usada confere com a doc. |
| R3 | `/plumb-dream` sobre uma sessão em que o agente improvisou duas vezes uma competência (ex.: montou à mão o mesmo teste de UI) | Lista a lacuna com a evidência citada (trecho da sessão) e recomenda uma skill ou ferramenta pela ferramenta de perguntas; com o "sim" instala com revisão de segurança ou registra em `context/stack`; sem "sim", nada muda. |

## Setup

| # | Prompt / situação | Passa quando |
|---|---|---|
| P1 | `/plumb-setup` num repositório sem AGENTS.md/CLAUDE.md (o fixture) | Abertura única com a estrutura proposta (conexão, workspace com a fonte, project) e a lista das dez dimensões; espera o "sim"; depois **uma dimensão por mensagem**, cada uma com "Inferi (evidência)" e "Preciso de você" com recomendação; grava a dimensão depois da resposta, num `item_save`; progresso em `spec/setup-<repo>`; nada inferido sem evidência; nada criado de estrutura sem o "sim"; ao fim, ao menos 10 itens entre `context`, `rule` e `howto`, com subtipo, scope e origin coerentes (`user` o respondido, `code` o confirmado do código), `AGENTS.md` com até 24 linhas (comandos, `Worktree:` e Workflow); nenhuma permissão gravada em `settings.json`; a dimensão de ferramentas termina com **recomendações de docs, MCP e skill** por múltipla escolha, cada uma com o sinal citado (dependência, `claude mcp list`, skills instaladas), gravadas em `context/stack`; o `AGENTS.md` traz a linha `Worktree:` e o bloco Plumb tem no máximo 24 linhas; toda pergunta é chamada da ferramenta de perguntas. |
| P2 | `/plumb-setup` num repositório com CLAUDE.md, `.claude/rules/` e uma skill de projeto | Migração dentro das dimensões: regras viram `rule/*` com os mesmos `scope_paths` e `origin` user, a skill de texto vira `howto/*`; remove os arquivos migrados só depois do lote gravar; preserva o conteúdo fora dos marcadores. |
| P3 | `/plumb-setup` no fixture com remote do GitHub e um front em Vite | Na dimensão de ferramentas, no máximo 5 sugestões, cada uma com o sinal; `gh` e Playwright CLI antes dos MCPs equivalentes; nada instalado antes do "sim"; cada ferramenta instalada entra no grupo "Ferramentas" e em `context/stack`. |
| P4 | `/plumb-setup` interrompido na dimensão 4 e retomado em sessão nova | Acha `spec/setup-<repo>`, diz onde parou e segue da dimensão 5, sem repetir o que já foi gravado. |
| P5 | Usuário responde "pula" e "não usamos Figma" | A dimensão adiada fica marcada na spec do setup; "não usamos" vira linha em `context/stack` e nunca é perguntado de novo. |
| F1 | `/plumb-setup` num repositório só com README ("API de agendamentos para clínicas") | Modo fundação: não despacha exploradores; as decisões vêm como **propostas** com o porquê, numa dimensão por mensagem; depois do "sim", uma `rule/decision` por decisão (com `## Por quê` e `## Alternativa descartada`) e `context/projeto-novo`; nenhum `rule/pattern` nem `howto`; sugere o esqueleto como primeira mudança. |
| W1 | `/plumb-setup` num projeto não ligado cujo dono já tem um workspace | Procura antes de criar (`workspace_list`); propõe o existente com a fonte e pede confirmação; nunca cria um segundo workspace com outra grafia. |
| C2 | Cursor: `/plumb-setup` no fixture | Identifica o Cursor; conhecimento vai para o cérebro; nenhum `CLAUDE.md` e nenhuma permissão gravada; MCPs como entradas de `.cursor/mcp.json`. |
| C3 | `/plumb-setup` num repositório com `.claude/rules/` e `.cursor/rules/` | Migra as duas para os mesmos itens (sem duplicar regra igual); aponta divergência entre `.claude/rules/x.md` e `.cursor/rules/x.mdc` como pergunta. |

## Dream

| # | Prompt / situação | Passa quando |
|---|---|---|
| DR1 | `/plumb-dream` depois de uma sessão com uma correção do usuário e um comando que falhou duas vezes | Roda o extrator no transcript (nunca lê o jsonl cru), propõe ao menos 2 itens agrupados por destino, cada um com um trecho curto da fala ou do erro como evidência (nunca o número da linha do transcript) e a marca grava/confirma; nada gravado antes do "sim"; depois um `item_save` e `spec/dream-last` regravado. |
| DR2 | `/plumb-dream desde <data>` com 3 transcripts | Despacha `plumb-explorer` um por transcript (até 3 em paralelo), cada um com o extrator; consolida o mesmo assunto de sessões diferentes como uma causa só. |
| DR3 | `/plumb-dream auditoria` com um item nunca aberto, um em `review` e uma tag sem item | Lê o relatório do servidor; propõe reforçar `keywords`/escopo antes de arquivar; `tag_delete` com prévia; nunca apaga `origin` user sem perguntar. |
| DR4 | Sessão sem nada que valha guardar | Diz em uma linha o que olhou e que não há o que propor. |

## Instalação e Cursor

| # | Prompt / situação | Passa quando |
|---|---|---|
| T2 | Verificação de UI com Playwright MCP instalado | O `plumb-tester` (com `disallowedTools`, sem `tools`) enxerga e usa as ferramentas do MCP. |
| T3 | `npx plumb-harness install --claude` sobre uma instalação 4.x | Remove `plumb-dreamer`, `plumb-curator`, `plumb-verifier`, `plumb-security`, `plumb-retro` do Plumb (e só deles); grava os três hooks sem duplicar; `status` mostra `hook de entrada: sim`. |
| C1 | Cursor: "implementa o PAY-142" com `install --cursor` | A skill `plumb` carrega; a spec sai no mesmo formato; os subagentes `plumb-*` de `~/.cursor/agents/` são usados, e o `plumb-tester` consegue rodar a suíte (sem Ask mode); os de leitura não editam por regra do texto. |

## Lacunas conhecidas

- C1–C3 e E6 ainda não rodados: falta a CLI do Cursor (`cursor-agent`) nesta
  máquina. Codex só recebe o parágrafo de Workflow do AGENTS.md.
- Plan mode (a spec via ExitPlanMode) não é exercitável com `claude -p`.
- Sem fixture de UI web ou mobile.
- Os casos marcados **(servidor v2)** só rodam depois da virada do Knowledge OS v2
  (`change/brain-v2` no repositório do servidor).
- O dream no Cursor não lê transcript (o Cursor não grava o jsonl do Claude Code).
