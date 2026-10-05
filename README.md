# Plumb

Fluxo spec-driven leve para agentes de código no Claude Code e no Cursor,
com memória de longo prazo. Peça uma mudança em linguagem natural —
`"implementa o PAY-142"`, `"corrige o bug do login"` — e o Plumb dimensiona
o trabalho, combina com você os critérios de aceite, constrói em TDD, prova
que funciona e pergunta antes de qualquer coisa sair da sua máquina.

Você decide **o que será construído** e **o que será entregue**. O resto é
com o agente, que te mantém informado pelo chat e pela lista de tarefas da
sessão.

O que se aprende no caminho — convenções, regras de cada área, decisões e o
porquê, procedimentos, armadilhas — vai para um **segundo cérebro** local
(Knowledge OS), e cada sessão nova começa com o que importa daquele projeto
já no contexto.

## Instalação

Pacote npm, sem dependências (Node 18+). Instala globalmente as skills, os
subagentes, a instrução que faz qualquer sessão reconhecer o Plumb e o
registro do segundo cérebro. Antes, instale o Knowledge OS (comando
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
| Segundo cérebro | MCP `knowledge-os` no escopo user (perfil `agent`, 6 ferramentas) + hook `SessionStart` em `~/.claude/settings.json` | `~/.cursor/mcp.json` + hook `sessionStart` em `~/.cursor/hooks.json` |

Sem o `knowledge-mcp` no PATH, o instalador avisa e não registra o cérebro
— rode o install de novo depois de instalá-lo.

Outros comandos:

```bash
npx plumb-harness status                       # versões instaladas e o cérebro
npx plumb-harness install --both               # atualizar: rode o install de novo
npx plumb-harness uninstall --claude           # remove skills, agentes, instrução e hook (o cérebro e os dados ficam)
npx plumb-harness install --both --project     # só no projeto atual (.claude/, .cursor/, .mcp.json)
npx plumb-harness install --claude --no-brain  # sem registrar o cérebro
```

Depois, uma vez por repositório:

```
/plumb-setup
```

Ele liga o repositório ao cérebro (workspace = empresa ou contexto, domain = o repositório),
descobre comandos, convenções e áreas sensíveis e **propõe tudo de uma vez, com
as decisões que tomou e a fonte de cada uma**: os itens do cérebro (contexto do
projeto, convenções, regras com escopo, procedimentos), o que vale para todo
projeto (vai para o workspace `Global`), o bloco de comandos no `AGENTS.md`, o
`CLAUDE.md` (`@AGENTS.md`), permissões em `.claude/settings.json` (confirmar
`git push` e `gh pr create`; liberar testes, lint e o cérebro) e até 5
ferramentas do catálogo escolhidas pelos sinais do código. Você revisa e aprova.
Num repositório que já tem regras e skills em arquivos, ele as migra para o
cérebro e enxuga os arquivos; num projeto já ligado, faz uma auditoria. Num
projeto novo, sem código, ele **propõe** as decisões de base (stack, estrutura,
testes, API e erros, persistência, CI e convenções) a partir do que você disse
que o projeto vai ser, e sugere o esqueleto como primeira mudança. As regras e
os procedimentos nascem depois, dos padrões que as primeiras mudanças
estabelecem.

A partir daí é só pedir mudanças — a skill `plumb` dispara sozinha.

## Como funciona

```
entender o pedido → planejar → [você aprova o plano] → construir → verificar → [você decide push/PR] → entregue
```

| Trilha | Quando | Cerimônia |
|---|---|---|
| **direta** | Typo, config, bug de causa óbvia | Nenhuma: corrige, roda os checks, reporta com evidência |
| **padrão** | A maior parte do trabalho | Um plano no segundo cérebro (`mudanca/<id>`); você aprova antes do código |
| **profunda** | Feature entre módulos, migração, contrato, auth/pagamento/dados pessoais | O mesmo plano + design com opções + revisão de segurança |

Antes das trilhas, o orquestrador classifica a **intenção**: pergunta (responde e
para), regra ou decisão enunciada (grava no cérebro na hora, sem gate), investigação
(só leitura, o achado vira item), hotfix e dependência/docs (trilha direta) ou mudança
de código. Pedido misto é separado: a diretriz não herda a cerimônia da mudança.

O plano é também o handoff: ele aparece em "Mudanças em andamento" no início de
toda sessão, e "continua o PAY-142" retoma pelo andamento e pelas tarefas que
faltam — sem pasta nenhuma no repositório.

**Decide, você revisa.** O Plumb decide com base no que você disse, no segundo
cérebro, nas instruções e no código, e o plano mostra cada decisão com a fonte
("Erro em português — regra do projeto"). Você revisa e aprova, ou corrige uma
decisão. Pergunta é exceção: só quando a informação não existe em lugar nenhum e
errar seria caro. Depois do "sim", ele segue até a entrega — para de novo só
antes de algo sair da máquina (push, PR) ou num impeditivo crítico.

**Conversa.** No terminal, ele fala do que está acontecendo com o código ("✓ O
Pix já devolve o QR code — testes 5 de 5"), não do método ("T1 concluída, lote
L2"): sem ids internos, sem nomes de etapa nem de subagente, e sem narrar a
leitura dos próprios arquivos.

As tasks são agrupadas em **lotes** (mesmos arquivos = um despacho e um commit), a
suíte completa roda uma vez, no verificador, e a revisão de segurança é uma lente do
revisor, a não ser na trilha profunda.

O cérebro entra em quatro pontos: o pacote do projeto no início da sessão;
as regras da área e as decisões e procedimentos parecidos ao moldar; uma
busca pelo sintoma quando algo trava; e uma gravação em lote ao fechar.

## Papéis

| Papel | Onde | Faz |
|---|---|---|
| Orquestrador | skill `plumb` (sessão principal) | Classifica o pedido, escolhe a rota, conduz os gates e o estado; monta os prompts, delega e grava no cérebro |
| Explorador | `agents/plumb-explorer.md` | Responde perguntas sobre o código com `arquivo:linha` (só leitura) |
| Planejador | `agents/plumb-planner.md` | Critérios de aceite, tasks, design, perguntas (só leitura) |
| Implementador | `agents/plumb-implementer.md` | Um lote de tasks (mesmos arquivos) em TDD, só nos arquivos declarados |
| Verificador | `agents/plumb-verifier.md` | Prova independente: checks, critério → evidência, execução real |
| Revisor | `agents/plumb-reviewer.md` | Diff contra a spec e as regras do cérebro: bugs com cenário de falha, escopo, convenções; com a lente de segurança em área sensível |
| Revisor de segurança | `agents/plumb-security.md` | Trilha profunda: injeção, autorização, segredos, dados pessoais, dinheiro |
| Curador de contexto | `agents/plumb-curator.md` | O que guardar no cérebro, com tipo, chave, escopo e texto exato — devolve o lote pronto para `item_save` |

Os agentes usam `disallowedTools` (edição de arquivos e escrita no
cérebro) em vez de uma lista fixa, para herdarem as ferramentas MCP que o
projeto instalar (navegador, Sentry, banco somente leitura) e lerem o
cérebro. Só o orquestrador grava no cérebro, numa chamada por mudança.

Subagentes não veem a conversa. Por isso todo despacho segue o contrato de
prompt (`skills/plumb/references/prompt-contract.md`): objetivo, contexto
(incluindo só os itens do cérebro que valem para a área), tarefa,
restrições, critério de pronto e o que fazer se travar.

## Segundo cérebro

No repositório ficam só os comandos e o Workflow no `AGENTS.md` e as
permissões. O resto mora no Knowledge OS
(SQLite local em `~/.knowledge-os`), organizado como o seu trabalho:

```
Polara                     ← workspace: a empresa, o cliente, ou Pessoal
 ├─ Geral                  ← convenções que valem para os repositórios da Polara
 ├─ projpro                ← domain: um repositório
 └─ synapse
Global                     ← o que vale para você em qualquer lugar
```

Uma sessão no projpro carrega o domain dele, o `Geral` da Polara e o `Global` — nunca
o de outro repositório. Um repo novo do mesmo dono no git cai sozinho no workspace
certo. Quando guardar, de que tipo e onde: `skills/plumb/references/brain-items.md`.

| O quê | Item | Chega ao agente |
|---|---|---|
| Plano de cada mudança | `task` (`mudanca/<id>`); `done` ao entregar | "Mudanças em andamento" no início da sessão |
| Convenção, stack, mapa, áreas sensíveis | `context` / `rule` no domain do projeto | Hook de início de sessão |
| Regra de uma área | `rule` com `scope_paths` | `context_get` com os arquivos que a mudança toca |
| Decisão e o porquê | `insight`, com a mudança de origem | Pacote ("Decisões recentes") e busca |
| Procedimento repetível | `procedure` | Pacote e busca na hora de moldar |
| Padrão novo, gotcha | `pattern`, `knowledge` | Pacote e busca (ao travar, antes de tudo) |
| Convenção da empresa ou do cliente | domain `Geral` do workspace | Em todos os repositórios daquele contexto |
| Diretriz sua em qualquer contexto (idioma, estilo, preferências, ambiente) | `Global / Geral` | Em todo projeto |

- **Barato:** perfil `agent` com 6 ferramentas (~1,8 mil tokens de
  definição); o pacote do hook cabe em ~1,2 mil tokens e lista o que ficou
  de fora.
- **Ciclo de vida:** o que as mudanças aprendem já vale, sem aprovação; a
  entrega diz o que foi guardado e você corrige o que não fizer sentido. A
  `/plumb-retro` aposenta o que envelheceu ou nunca foi usado.
- **Fora do ar:** o Plumb avisa e segue; o que gravaria vai para
  `~/.knowledge-os/pending.jsonl` e entra na próxima sessão.
- **Segredos sem passar pelo modelo:** o agente cria o segredo vazio, você
  preenche pelo link da UI local, e ele usa por `knowledge-mcp run`, que
  entrega o valor só ao comando e redige a saída.
- **Seguro:** a busca não usa rede nem embeddings.

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
   plano rejeitado, travamento, retrabalho, procedimento repetível, padrão
   novo, fato velho ou lacuna de ferramenta vira uma linha na seção Retro
   do plano. Um `padrão novo` (o primeiro endpoint, a primeira
   migration) vira, no fechamento, um item `pattern` com escopo apontando o
   arquivo criado como modelo — é assim que um projeto novo consolida as
   convenções. Regra enunciada vai ao curador e ao cérebro na hora.
2. **No fechamento:** 1–2 sinais simples o orquestrador grava sozinho; 3 ou
   mais vão num único despacho do curador. Tudo entra numa chamada
   (`item_save`, junto com o plano concluído) e a entrega diz,
   numa linha, o que foi guardado — sem perguntar. Se a regra já existia e foi
   ignorada, o ajuste é reforçá-la, não duplicá-la.
3. **`/plumb-retro`** (sugerida a cada 5 mudanças): agrupa causas que se
   repetem, propõe até 5 ajustes com sinal-alvo, aposenta os itens
   que envelheceram e, na retro seguinte, confere se o sinal diminuiu — manter,
   reforçar ou reverter. Histórico no item `retro/ultima`; o próprio pacote do
   início da sessão avisa quando há 5 mudanças concluídas desde a última.

## Custo

- `model` e `effort` por agente: explorador e verificador em `sonnet` com
  esforço baixo; implementador em `sonnet` (o orquestrador sobe para o
  modelo da sessão na trilha profunda ou depois de uma falha); planejador,
  revisores e curador no modelo da sessão com esforço alto.
- Planejamento sem subagente quando a área é pequena; tasks pequenas nos
  mesmos arquivos num só despacho.
- Retroalimentação: 1–2 sinais simples o orquestrador grava sozinho; 3+ vão
  num único despacho do curador, nunca um por sinal; a retro lê só o cabeçalho e a seção Retro dos arquivos arquivados.
- `AGENTS.md` com até 20 linhas (comandos e Workflow); o conhecimento chega
  pelo pacote do cérebro, com orçamento. Ao tocar uma área, uma consulta traz as
  regras dela e o começo do content, sem `item_get` depois.
- `SKILL.md` do orquestrador com ~14 KB; o que só vale às vezes (lotes em paralelo,
  tabela de sinais, molde de item) fica em `references/`, lido sob demanda.
- Medido nos evals: cada sessão do Claude Code começa com 35–70 mil tokens
  de contexto fixo, quase todo do próprio Claude Code e da sua configuração
  global. Confira o seu com `/context`.

## Recursos nativos usados

Skills e subagentes do Claude Code; `AGENTS.md` importado pelo `CLAUDE.md`;
hook `SessionStart` com `additionalContext` (pacote do cérebro); MCP no
escopo user; lista de tarefas da sessão para o progresso; `permissions.ask`
para push/PR; isolamento em worktree para tasks paralelas; plan mode +
ExitPlanMode para apresentar o plano quando a sessão está em plan mode. Sem build e
sem dependências no lado do Plumb.

**Limitação conhecida:** a regra `Bash(git push *)` não pega variações com
opções antes do subcomando (`git -c x=y push`). A pergunta de push/PR da entrega continua
valendo nesses casos.

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
| Segundo cérebro | MCP `knowledge-os` (user) + hook `SessionStart` | `~/.cursor/mcp.json` + hook `sessionStart` (`additional_context`) |
| Permissões | `.claude/settings.json`: `allow`, `ask`, `deny` | `.cursor/cli.json`: `allow`, `deny` (sem "ask": o que não está liberado pede aprovação) + `.cursor/permissions.json` com a política em texto para o modo auto-review |
| MCP | `claude mcp add` → `.mcp.json` | `.cursor/mcp.json` |
| Lista de tarefas, plan mode | TaskCreate/TodoWrite, ExitPlanMode | to-dos do agente, modo Plan |

**Limitações no Cursor:** sem `ask`, a confirmação de push/PR depende da
política de auto-review e da pergunta de push/PR da entrega, não de uma regra
determinística; tasks em paralelo só rodam em sequência (sem isolamento
em worktree garantido); os agentes não usam `readonly` (no Cursor ele vira Ask mode e bloqueia shell e MCP), então a regra "não edite" é só do texto do agente, sem bloqueio
específico da escrita no cérebro; plugins do Claude Code do catálogo (LSP,
Sentry, Semgrep, Figma) viram a alternativa MCP da mesma linha. A
compatibilidade foi montada a partir da documentação do Cursor e dos
formatos da instalação local, **ainda sem um eval rodado no Cursor** — ver
`evals/cases.md`.

**Outras ferramentas** que leem `AGENTS.md` (Codex e afins) recebem o
parágrafo de Workflow que o `/plumb-setup` grava nele.

## Ideias de onde vieram

| Ideia | Origem |
|---|---|
| Triagem por tamanho e caminho leve para correções pequenas | BMAD Quick Flow, Kiro Quick Spec |
| Uma pasta de mudanças, arquivada ao concluir | OpenSpec |
| O agente decide com fonte, o humano revisa o plano | Spec Kit `/clarify` (invertido: decisões em vez de perguntas) |
| Critérios de aceite prováveis (Dado/quando/então) | BDD |
| Evidência antes de dizer "pronto"; TDD; parar quando travar | Superpowers |
| Revisor com contexto limpo e veredito curto | Superpowers v6 |
| Arquivo de progresso, baseline e uma task por vez | Anthropic, *Effective harnesses for long-running agents* |
| Contexto fixo mínimo, o resto sob demanda | Kiro steering; Anthropic, *Effective context engineering* |
| Memória com classes, escopo e consolidação periódica | Knowledge OS; memória de agentes no estilo Letta/MemGPT |

## Estrutura do repositório

```
skills/plumb/              orquestrador + references/ (contrato de prompt, modelo da mudança, testes)
skills/plumb-setup/        ligação ao cérebro, estruturação, migração e auditoria + references/catalog.md
skills/plumb-retro/        retrospectiva periódica e limpeza do cérebro
skills/plumb-find-docs/    documentação atual de bibliotecas (Context7) — cópia fixada
skills/plumb-find-skills/  descobrir skills sob demanda, com revisão de segurança — cópia fixada
agents/                    os 7 subagentes
evals/                     casos, resultados e um fixture sem dependências
bin/cli.js, lib/           instalador npm (install, uninstall, status; registra o cérebro)
global-instruction.md      bloco gravado em ~/.claude/CLAUDE.md (ou User Rules do Cursor)
test/                      testes do instalador (npm test)
```

## Desenvolvimento

Edite o markdown, rode de novo os casos afetados de `evals/cases.md` contra
`evals/fixture/` e registre em `evals/results.md`. Mantenha o
`skills/plumb/SKILL.md` com até ~350 linhas; o que só é preciso às vezes vai
para `references/`, com um nível só.

O instalador tem testes: `npm test`.

A versão 1 (CLI em TypeScript, 10 skills, memória Memanto/Obsidian, ciclo
"dream") está no histórico do git, antes do commit da v2. A v3 traz o
segundo cérebro como memória obrigatória.

## Licença

MIT
