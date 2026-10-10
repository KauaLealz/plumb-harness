# Plumb

Fluxo spec-driven leve para agentes de código no Claude Code e no Cursor,
com memória de longo prazo. Peça qualquer coisa — uma pergunta,
`"implementa o PAY-142"`, `"corrige o bug do login"` — e o Plumb dimensiona o
trabalho, consulta o que o projeto já aprendeu, entrevista você até os dois terem o
mesmo entendimento, combina os critérios de
aceite, constrói em TDD num worktree próprio, prova que funciona e pergunta antes de qualquer coisa
sair da sua máquina.

Você decide **o que será construído** e **o que será entregue**. O resto é
com o agente, que te mantém informado pelo chat e pela lista de tarefas da
sessão.

O que se aprende no caminho — convenções, regras de cada área, decisões e o
porquê, procedimentos, armadilhas — vai para um **segundo cérebro** local
(Knowledge OS), e cada sessão nova começa com o que importa daquele projeto
já no contexto.

## Instalação

Pacote npm, sem dependências (Node 18+). Instala globalmente as skills, os
subagentes, a instrução que faz qualquer sessão reconhecer o Plumb, os hooks de
entrada e o registro do segundo cérebro. Antes, instale o Knowledge OS (comando
`knowledge-mcp`, Python 3.11+ com [uv](https://docs.astral.sh/uv/)):

```bash
uv tool install --editable <pasta do Knowledge OS>
```

Depois:

```bash
npx plumb-harness install            # pergunta: Claude Code, Cursor ou os dois
npx plumb-harness install --claude   # ou direto: --claude, --cursor, --both
```

Enquanto o pacote não está publicado no npm, instale direto do GitHub:

```bash
npx github:KauaLealz/plumb-harness install
```

| | Claude Code | Cursor |
|---|---|---|
| Skills | `~/.claude/skills/` | `~/.cursor/skills/` (com `--both`, o Cursor lê as de `~/.claude/skills/`) |
| Subagentes | `~/.claude/agents/` | `~/.cursor/agents/`, na variante do Cursor (`model: inherit`, sem `readonly`) |
| Instrução global | bloco em `~/.claude/CLAUDE.md`, entre marcadores, preservando o resto | o Cursor guarda regras globais só na interface: o instalador imprime o texto para colar em Settings → Rules → User Rules |
| **Entrada** | hooks em `~/.claude/settings.json`: `UserPromptSubmit` (o lembrete do Plumb em **toda** mensagem), `SessionStart` (avisa de diretrizes da sessão anterior que ficaram sem gravar) e `Stop` (rede de segurança: bloqueia **uma vez** se você enunciou uma regra e nada foi gravado) | hook `sessionStart` em `~/.cursor/hooks.json` com o lembrete (o hook por prompt do Cursor não injeta contexto) |
| Segundo cérebro | MCP `knowledge-os` no escopo user + hook `SessionStart` do pacote de contexto | `~/.cursor/mcp.json` + hook `sessionStart` |

Sem o `knowledge-mcp` no PATH, o instalador avisa e não registra o cérebro —
rode o install de novo depois de instalá-lo. Os hooks de entrada não dependem dele.

Outros comandos:

```bash
npx plumb-harness status                       # versões instaladas, hooks e o cérebro
npx plumb-harness install --both               # atualizar: rode o install de novo
npx plumb-harness uninstall --claude           # remove skills, agentes, instrução e hooks (o cérebro e os dados ficam)
npx plumb-harness install --both --project     # só no projeto atual (.claude/, .cursor/, .mcp.json)
npx plumb-harness install --claude --no-brain  # sem registrar o cérebro
```

Depois, uma vez por repositório:

```
/plumb-setup
```

É uma **entrevista com pesquisa**: o Plumb explora o repositório, liga-o ao
cérebro (workspace = a empresa ou o contexto, project = o repositório) e percorre
**dez dimensões**, uma por mensagem — produto e domínio, stack e ambiente, mapa do
código, comandos, convenções, áreas sensíveis, procedimentos, ferramentas e
acessos, time e fluxo, e as suas preferências. Em cada uma mostra o que inferiu
**com a evidência** (arquivo, comando, linha do git) e pergunta o que o código não
conta, com a recomendação dele; você confirma, corrige ou pula, e a dimensão grava
depois do seu "sim". Sem teto de perguntas, mas só o que o repositório não
responde e que melhora o trabalho futuro. O progresso fica numa spec e o setup
retoma de onde parou. No fim: o bloco de comandos no `AGENTS.md`, o `CLAUDE.md`
(`@AGENTS.md`) e até 5 ferramentas do catálogo
escolhidas pelos sinais do código. Num repositório que já tem regras e skills em
arquivos, ele as migra para o cérebro e enxuga os arquivos; num projeto já ligado,
faz uma auditoria; num projeto novo, sem código, **propõe** as decisões de base com
o porquê e a alternativa descartada.

A partir daí é só pedir — a skill `plumb` entra sozinha, em todo pedido.

## Como funciona

```
pedido → rota → consultar o cérebro → [grill: você responde] → [spec: você aprova] → construir no worktree → provar → aprender → [você decide push/PR/merge] → entregue
```

**Entrada.** Um hook injeta um lembrete curto do Plumb em toda mensagem (no Claude
Code), e a skill carrega uma vez por conversa. A skill atende **qualquer** pedido,
com cerimônia proporcional:

| O pedido é… | Rota |
|---|---|
| pergunta ou explicação | consulta o cérebro, responde, para |
| regra, diretriz ou decisão enunciada | grava na hora, confirma em uma linha |
| investigação | só leitura; o achado durável vira item |
| hotfix, dependência, docs, correção pequena | **trilha direta**: corrige, roda os checks, reporta com evidência |
| mudança de código | **padrão** (spec no cérebro, você aprova) ou **profunda** (spec com design e revisão de segurança) |
| `/plumb-grill <tema>`, "me entrevista" | só a entrevista, sem spec nem código |
| `/plumb-setup`, `/plumb-dream` | entrevista de base; análise da sessão |

| Trilha | Quando | Cerimônia |
|---|---|---|
| **direta** | Typo, config, bug de causa óbvia | Nenhuma: corrige, roda os checks, reporta com evidência |
| **padrão** | A maior parte do trabalho | Uma spec no segundo cérebro (`spec/<id>`); você aprova antes do código |
| **profunda** | Feature entre módulos, migração, contrato, auth/pagamento/dados pessoais | A mesma spec + design com opções + revisão de segurança |

A spec é também o handoff: ela aparece nas specs ativas no início de toda
sessão, e "continua o PAY-142" retoma pelo andamento e pelas fases que faltam —
sem pasta nenhuma no repositório.

**Grill: o agente pergunta, você decide.** Em mudança padrão ou profunda o Plumb
não adivinha: antes da spec ele entrevista você no modelo *grill-me* — **uma
pergunta por vez**, sempre com a recomendação dele em primeiro, na ordem em que
uma decisão depende da outra. Antes de perguntar ele explora o código, o cérebro
e o card: o que eles já respondem não vira pergunta. A entrevista termina num
resumo do entendimento, e só com o seu "sim" vira spec; na trilha direta só há
pergunta se o pedido for ambíguo. `/plumb-grill <tema>` roda só a entrevista,
quando você quer alinhar sem construir. **Toda pergunta** — grill, setup, dream,
aprovação, entrega — vai pela ferramenta de perguntas do Claude (opções
clicáveis); no Cursor, que não a tem, vira lista numerada com a recomendação na
opção 1. Depois da aprovação ele segue até a entrega e para de novo só antes de
algo sair da máquina (push, PR, merge) ou num impeditivo crítico. **Ao gravar
conhecimento a regra é a oposta:** o que você ditou grava; o que o agente inferiu
espera o seu "sim", porque um item errado envenena todas as sessões seguintes.

**Worktree por mudança.** Mudança padrão ou profunda trabalha em
`.claude/worktrees/<id>`, numa branch própria, e a árvore principal fica intacta
(a direta segue nela). Antes da entrega o Plumb traz a base para a branch (merge,
sem reescrever histórico), roda os testes de novo e pergunta: push, PR ou merge
local; o worktree só é limpo com o seu "sim". O setup pergunta como preparar um
worktree novo (instalar dependências, copiar `.env`) e grava na linha
`Worktree:` do `AGENTS.md`.

**Coordenação no próprio item.** Vários agentes na mesma base se enxergam pela
spec, sem campo nem ferramenta nova: o `summary` segue
`<estado> · <fase n/total> · <branch> · <worktree> · <agente>`, o topo do conteúdo
traz Trilha, Agente, Base, Branch, Worktree e Atualizado, e as tags dizem o
estado (`aguardando-aprovacao`, `em-andamento`, `parada`; ao concluir saem) e a
área (1 a 3, reaproveitadas de `tag_list`). Quem abre uma mudança numa área onde
outra spec está ativa pergunta se sequencia ou paraleliza; "o que está em
andamento?" lista as specs pelo resumo e aponta órfãos (worktree sem spec ativa,
spec ativa sem worktree, sem atualização há mais de 3 dias); retomar entra no
worktree e assume o campo Agente. Toda vez que cria, atualiza ou entrega uma
spec, o Plumb cola o link `url` dela na interface do cérebro.

**Ferramentas no momento certo.** Na fase de entender, uma checagem: a mudança
usa biblioteca → `plumb-find-docs` antes de escrever (também na trilha direta);
o card cita um sistema sem acesso → `plumb-find-mcps`; falta uma competência →
`plumb-find-skills`. A recomendação chega pela ferramenta de perguntas e nada é
instalado sem o seu "sim". O setup varre dependências, MCPs e skills já
instalados e recomenda o que fecha lacunas; o dream faz o mesmo a partir da
sessão, citando a evidência.

**Conversa.** No terminal, ele fala do que está acontecendo com o código ("✓ O
Pix já devolve o QR code — testes 5 de 5"), não do método ("fase 1 concluída"):
sem ids internos, sem nomes de etapa nem de subagente, e sem narrar a leitura dos
próprios arquivos.

## Papéis

| Papel | Onde | Faz |
|---|---|---|
| Orquestrador | skill `plumb` (sessão principal) | Atende o pedido, escolhe a rota, conduz os gates e o estado; consulta e grava o cérebro em cada fase, **inclusive o fechamento** (decide o que dura, com a conversa na mão) |
| Explorador | `agents/plumb-explorer.md` | Responde perguntas sobre o código com `arquivo:linha` (só leitura); no `/plumb-dream desde…`, varre as sessões antigas |
| Planejador | `agents/plumb-planner.md` | A spec: resultados esperados observáveis, fases com papel, dependência e critério de saída (só leitura) |
| Implementador | `agents/plumb-implementer.md` | Uma fase em TDD, só nos arquivos declarados, com commit atômico |
| Testador | `agents/plumb-tester.md` | Prova que funciona — **sem ver o diff**: cada resultado esperado com evidência executada |
| Revisor | `agents/plumb-reviewer.md` | Lê o diff contra a spec — **não roda nada**: bugs com cenário de falha, escopo, convenções, e segurança quando a lente está ligada |

Não há um agente "curador" nem "dreamer": quem decide o que guardar é o orquestrador,
porque é o único que viu a conversa inteira. Os agentes usam `disallowedTools`
(edição de arquivos e **toda escrita no cérebro**) em vez de uma lista fixa, para
herdarem as ferramentas MCP que o projeto instalar (navegador, Sentry, banco
somente leitura) e lerem o cérebro. Só o orquestrador grava, numa chamada por
mudança.

Subagentes não veem a conversa. Por isso todo despacho segue o contrato de
prompt (`skills/plumb/references/prompt-contract.md`): objetivo, contexto
(incluindo só os itens do cérebro que valem para a área), tarefa,
restrições, critério de pronto e o que fazer se travar.

## Segundo cérebro

No repositório ficam só os comandos e o Workflow no `AGENTS.md`. O resto mora no Knowledge OS (uma pasta git local por conexão,
com um arquivo Markdown por item), organizado como o seu trabalho:

```
workspace   o contexto: a empresa, o cliente, o seu pessoal
 └─ project   um repositório (ou um lugar de itens compartilhados)
     └─ subject   assunto com nome próprio (opcional, nasce tarde)
         └─ item   rule · howto · context · spec · secret, com subtipo
```

**Onde o item mora e onde ele vale são coisas diferentes.** Mora no project em que
foi salvo; vale conforme o `scope` — `scoped` (só aquele repositório), `workspace`
(todos os repositórios do contexto) ou `global` (qualquer projeto) —, herdado do
subject, do project e do workspace. Uma sessão no projpro encontra o que é do
projpro, o que vale para a empresa e o que vale para você, nunca o de outro
repositório que não foi compartilhado. Quando guardar, de que tipo, em que scope
e como relacionar: `skills/plumb/references/brain.md`.

| O quê | Item | Chega ao agente |
|---|---|---|
| Spec de cada mudança | `spec/<id>` (`draft` → `active` → `done`) | Specs ativas no início da sessão |
| O que o projeto é, mapa, stack e ferramentas | `context/*` | Pacote do hook |
| Regra, convenção, molde de composição | `rule/*` (subtipos: code, pattern, security, business, process, decision) | Pacote; a busca com os arquivos da mudança traz as de escopo estreito |
| Decisão e o porquê | `rule/decision`, com a alternativa descartada | Busca |
| Procedimento e diagnóstico | `howto/*`, `howto/troubleshoot` | Busca (ao travar, antes de tudo) |
| Segredo | `secret/*`, **sem valor** | Link para você preencher na UI |

- **Em toda fase, não só no fim.** O `SKILL.md` traz uma tabela de contrato: o que
  ler, o que gravar e que feedback dar em cada momento (resposta, diretriz,
  investigação, localizar, entender, especificar, construir, provar, aprender).
- **O cérebro aprende com o uso.** No fechamento, o orquestrador avisa o que
  ajudou, o que não serviu, o que estava velho e o que a prova confirmou
  (`item_feedback`); o servidor usa isso no ranking, na limpeza e no relatório da
  auditoria.
- **Barato:** o pacote do hook cabe em ~1,2 mil tokens e lista o que ficou de
  fora; o lembrete de entrada tem 10 linhas.
- **Fora do ar ou sem conexão:** o Plumb avisa e segue; o que gravaria vai para
  `~/.knowledge-os/pending.jsonl` e entra na próxima sessão.
- **Segredos sem passar pelo modelo:** o agente cria o segredo vazio, você
  preenche pelo link da UI local, e ele usa por `knowledge-mcp run`, que
  entrega o valor só ao comando e redige a saída.
- **Seguro:** a busca não usa rede nem embeddings.

A referência de ferramentas e do modelo é a do Knowledge OS v2 (32 ferramentas);
um teste de contrato (`npm test`) falha se qualquer skill citar uma ferramenta ou
um conceito que o servidor não tem.

## Skills de terceiros incluídas

Duas skills vêm junto com o Plumb, copiadas num commit fixo (origem e
licença em `SOURCE.md` / `LICENSE.upstream` de cada pasta):

- **`plumb-find-docs`** ([upstash/context7](https://github.com/upstash/context7),
  MIT) — consulta a documentação atual de qualquer biblioteca via
  `npx ctx7@latest`, em vez de confiar na memória do modelo. Usada pelo
  orquestrador, pelo planejador e pelo implementador quando há dúvida de
  API. As consultas vão para a API da Context7: nunca com segredos ou
  código proprietário.
- **`plumb-find-skills`** ([vercel-labs/skills](https://github.com/vercel-labs/skills),
  MIT) — encontra skills prontas quando falta uma capacidade (sinal
  `lacuna`). Ajuste local: em vez de instalar direto, exige revisão de
  segurança e o seu "sim", e prefere copiar para o seu repositório curado.

## Ferramentas

`skills/plumb-setup/references/catalog.md` cobre o núcleo (Knowledge OS),
economia de tokens (RTK, plugins LSP, Context7, statusline), tickets (gh,
GitLab, Jira/Confluence, Linear, Azure DevOps, Notion), documentação
(Microsoft Learn, AWS, DeepWiki, Mermaid), verificação de UI e mobile
(Playwright CLI/MCP, Chrome DevTools, axe, Maestro, mobile-mcp), design
(Figma, Storybook), API (Hurl, OpenAPI, Postman), dados somente leitura,
nuvem e deploy, observabilidade (Sentry, Grafana, Datadog), CI, segurança
(Semgrep, Trivy, Snyk, GitGuardian, SonarQube) e segredos. Cada linha liga
um sinal no repositório a uma habilidade, com o comando e o custo de
contexto. Regras: sinal antes de sugestão, CLI antes de MCP, no máximo 5,
somente leitura por padrão, nada sem o seu "sim". Entradas marcadas
*(confirmar)* não foram verificadas na documentação do fornecedor.

## Retroalimentação

1. **Sinais na hora:** cada regra enunciada, decisão durável, correção,
   spec rejeitada, travamento, retrabalho, procedimento repetível, padrão
   novo, fato velho ou lacuna de ferramenta vira uma linha na seção Retro
   da spec. Regra enunciada grava no cérebro na hora — e, se o agente deixar
   passar, o hook de fim de turno o lembra uma vez.
2. **No fechamento (fase Aprender, em toda trilha):** o orquestrador testa cada
   candidato pelo tipo, procura duplicata, escolhe o destino (repositório,
   workspace ou global) e grava tudo num `item_save`, junto da spec concluída. O
   que você ditou grava; o que ele inferiu aparece na entrega para o seu "sim".
   Depois dá o feedback de uso.
3. **`/plumb-dream`** — a skill que olha a **sessão inteira**: lê o transcript
   (os dois lados, os erros de ferramenta, as correções) e propõe o lote por
   destino, cada item com o turno que o sustenta, grava ou confirma. Com
   `desde <data>` varre as sessões antigas (um explorador por transcript); com
   `auditoria` revisa a saúde do cérebro (nunca abertos, em revisão, duplicados,
   tags vazias). Registra o que aplicou em `spec/dream-last` com o sinal-alvo, e o
   sonho seguinte confere se diminuiu. O início da sessão avisa quando a anterior
   deixou diretrizes sem gravar.

## Custo

- Nenhum agente crava modelo: todos herdam o da sessão, e o orquestrador aplica um
  tier por papel (rápido para explorador e testador, equilibrado para o
  implementador, capaz para planejador e revisor). Esforço por agente no
  frontmatter.
- Planejamento sem subagente quando a área é pequena; tarefas pequenas nos
  mesmos arquivos num só despacho.
- Fechamento sem subagente: nenhum despacho extra para decidir o que guardar.
- Lembrete de entrada de 10 linhas por mensagem; a skill carrega uma vez por
  conversa. `AGENTS.md` com até 24 linhas (comandos, Worktree e Workflow); o conhecimento
  chega pelo pacote do cérebro, com orçamento.
- `SKILL.md` do orquestrador com ~510 linhas; o que só vale às vezes (lotes em
  paralelo, tabela de sinais, molde da spec, o contrato do cérebro) fica em
  `references/`, lido sob demanda.
- Medido nos evals: cada sessão do Claude Code começa com 35–70 mil tokens
  de contexto fixo, quase todo do próprio Claude Code e da sua configuração
  global. Confira o seu com `/context`.

## Recursos nativos usados

Skills e subagentes do Claude Code; `AGENTS.md` importado pelo `CLAUDE.md`;
hooks `UserPromptSubmit`, `SessionStart` e `Stop` (com `additionalContext` e
`decision: block`); MCP no escopo user; lista de tarefas da sessão para o
progresso; isolamento em worktree para tarefas
paralelas; plan mode + ExitPlanMode para apresentar a spec quando a sessão está em
plan mode. Sem build e sem dependências no lado do Plumb.

**Push e PR:** o setup não grava permissões. A pergunta de push/PR da entrega é uma regra do
fluxo, não uma trava da ferramenta; quem quiser a trava configura `permissions` no próprio
`settings.json`.

## Cursor

O fluxo, os papéis, os gates, o cérebro e a retroalimentação são os
mesmos. O que muda é onde cada coisa é gravada — o `/plumb-setup` detecta a
ferramenta (ou pergunta) e gera os arquivos certos para cada uma, ou para
as duas.

| Parte | Claude Code | Cursor |
|---|---|---|
| Skills | `~/.claude/skills/` | `~/.cursor/skills/` (o Cursor também lê `~/.claude/skills/`) |
| Subagentes | `~/.claude/agents/` com `model`, `effort`, `disallowedTools` | `~/.cursor/agents/` com `model: inherit`, sem `readonly` (gerados pelo instalador) |
| Comandos do projeto | `AGENTS.md` via `CLAUDE.md` → `@AGENTS.md` | `AGENTS.md`, lido nativamente |
| Entrada | hooks `UserPromptSubmit` + `SessionStart` + `Stop` | hook `sessionStart` (sem hook por prompt: o lembrete vem uma vez por sessão) |
| Segundo cérebro | MCP `knowledge-os` (user) + hook `SessionStart` | `~/.cursor/mcp.json` + hook `sessionStart` (`additional_context`) |
| MCP | `claude mcp add` → `.mcp.json` | `.cursor/mcp.json` |
| Lista de tarefas, plan mode | TaskCreate/TodoWrite, ExitPlanMode | to-dos do agente, modo Plan |

**Limitações no Cursor:** sem hook por prompt nem `Stop` que injete contexto, a
entrada depende do lembrete do `sessionStart`, da instrução global e da
descrição da skill; tarefas
em paralelo só rodam em sequência (sem isolamento em worktree garantido); os
agentes não usam `readonly` (no Cursor ele vira Ask mode e bloqueia shell e MCP),
então a regra "não edite" é só do texto do agente; o `/plumb-dream` não lê
transcript (o Cursor não grava o jsonl do Claude Code); plugins do Claude Code do
catálogo (LSP, Sentry, Semgrep, Figma) viram a alternativa MCP da mesma linha. A
compatibilidade foi montada a partir da documentação do Cursor e dos formatos da
instalação local, **ainda sem um eval rodado no Cursor** — ver `evals/cases.md`.

**Outras ferramentas** que leem `AGENTS.md` (Codex e afins) recebem o
parágrafo de Workflow que o `/plumb-setup` grava nele.

## Ideias de onde vieram

| Ideia | Origem |
|---|---|
| Triagem por tamanho e caminho leve para correções pequenas | BMAD Quick Flow, Kiro Quick Spec |
| Uma spec por mudança, arquivada ao concluir | OpenSpec |
| O agente decide com fonte, o humano revisa a spec | Spec Kit `/clarify` (invertido: decisões em vez de perguntas) |
| Entrevista por dimensão antes de especificar, inferência com evidência | Spec Kit `/clarify`, BMAD (elicitação) |
| Critérios de aceite prováveis (Dado/quando/então) | BDD |
| Evidência antes de dizer "pronto"; TDD; parar quando travar | Superpowers |
| Revisor com contexto limpo e veredito curto | Superpowers v6 |
| Arquivo de progresso, baseline e uma tarefa por vez | Anthropic, *Effective harnesses for long-running agents* |
| Contexto fixo mínimo, o resto sob demanda | Kiro steering; Anthropic, *Effective context engineering* |
| Memória com classes, escopo e consolidação periódica | Knowledge OS; memória de agentes no estilo Letta/MemGPT |

## Estrutura do repositório

```
skills/plumb/              orquestrador + hooks/entry.mjs + references/ (contrato do cérebro, contrato de prompt, modelo da spec, worktrees, sinais, testes)
skills/plumb-grill/        entrevista grill-me: uma pergunta por vez, com recomendação (/plumb-grill)
skills/plumb-setup/        entrevista por dimensão, estruturação e migração + references/ (dimensões, catálogo)
skills/plumb-dream/        analisa a sessão inteira, varre sessões antigas, audita o cérebro + scripts/extract.mjs
skills/plumb-find-docs/    falta documentação? (Context7) — cópia fixada
skills/plumb-find-skills/  falta competência? descobrir skills, com revisão de segurança — cópia fixada
skills/plumb-find-mcps/    falta acesso? propor MCP por fase do trabalho
agents/                    os 5 subagentes
evals/                     casos, resultados e um fixture sem dependências
bin/cli.js, lib/           instalador npm (install, uninstall, status; registra hooks e cérebro)
scripts/run-tests.mjs      roda os testes sem depender de glob do shell
global-instruction.md      bloco gravado em ~/.claude/CLAUDE.md (ou User Rules do Cursor)
test/                      testes do instalador, do hook de entrada, do extrator do dream e do contrato com o cérebro (npm test)
```

## Desenvolvimento

Edite o markdown, rode de novo os casos afetados de `evals/cases.md` contra
`evals/fixture/` e registre em `evals/results.md`. Mantenha o
`skills/plumb/SKILL.md` com até ~520 linhas; o que só é preciso às vezes vai
para `references/`, com um nível só.

`npm test` roda os testes do instalador, do hook de entrada, do extrator e o
**teste de contrato**: lê todos os `.md` de `skills/` e `agents/` e falha se algum
citar uma ferramenta do cérebro ou um conceito que o Knowledge OS v2 não tem. A
lista das 32 ferramentas fica em `test/contract.test.js`, com a origem — quando o
servidor mudar, é lá que se atualiza.

A versão 1 (CLI em TypeScript, 10 skills, memória Memanto/Obsidian, ciclo
"dream") está no histórico do git, antes do commit da v2. A v3 traz o segundo
cérebro como memória obrigatória; a v4, a spec com fases; a v5, a entrada
obrigatória, o cérebro em toda fase e o fim do dreamer; a v6, o grill, o worktree por
mudança, a coordenação na spec e a recomendação de ferramentas.

## Licença

MIT
