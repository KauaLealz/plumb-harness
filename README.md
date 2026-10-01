# Plumb

Fluxo spec-driven leve para agentes de código no Claude Code. Peça uma
mudança em linguagem natural — `"implementa o PAY-142"`, `"corrige o bug do
login"` — e o Plumb dimensiona o trabalho, combina com você os critérios de
aceite, constrói em TDD, prova que funciona e pergunta antes de qualquer
coisa sair da sua máquina.

Você decide **o que será construído** e **o que será entregue**. O resto é
com o agente, que te mantém informado pelo chat e pela lista de tarefas da
sessão.

## Instalação

Cópia manual para as pastas globais do Claude Code (vale para todos os
seus projetos).

**Bash / macOS / Linux:**

```bash
git clone https://github.com/KauaLealz/plumb-harness.git
mkdir -p ~/.claude/skills ~/.claude/agents
cp -r plumb-harness/skills/* ~/.claude/skills/
cp plumb-harness/agents/*.md ~/.claude/agents/
```

**PowerShell (Windows):**

```powershell
git clone https://github.com/KauaLealz/plumb-harness.git
New-Item -ItemType Directory -Force "$HOME\.claude\skills", "$HOME\.claude\agents" | Out-Null
Copy-Item -Recurse -Force plumb-harness\skills\* "$HOME\.claude\skills\"
Copy-Item -Force plumb-harness\agents\*.md "$HOME\.claude\agents\"
```

Para atualizar, rode `git pull` e copie de novo. Para usar só em um
projeto, copie para `.claude/skills/` e `.claude/agents/` dele.

Depois, uma vez por repositório:

```
/plumb-setup
```

Ele descobre comandos, convenções e áreas sensíveis e propõe, numa única
aprovação: o bloco de fatos no `AGENTS.md`, o `CLAUDE.md` (`@AGENTS.md`),
regras com escopo em `.claude/rules/`, skills de projeto quando houver
procedimento repetível, permissões em `.claude/settings.json` (confirmar
`git push` e `gh pr create`; liberar os comandos de teste e lint) e até 5
ferramentas do catálogo escolhidas pelos sinais do código e por uma
entrevista curta. Em um repositório que já tem essa estrutura, ele faz uma
auditoria. Num projeto novo, sem código, ele entra em modo **fundação**:
entrevista as decisões de base (stack, estrutura, testes, API e erros,
persistência, CI e convenções), grava cada uma com o porquê e sugere o
esqueleto como primeira mudança. As regras e skills nascem depois, dos
padrões que as primeiras mudanças estabelecem.

A partir daí é só pedir mudanças — a skill `plumb` dispara sozinha.

## Como funciona

```
localizar → trilha → moldar → [gate 1] → construir → verificar → [gate 2] → entregar
```

| Trilha | Quando | Cerimônia |
|---|---|---|
| **direta** | Typo, config, bug de causa óbvia | Nenhuma: corrige, roda os checks, reporta com evidência |
| **padrão** | A maior parte do trabalho | Um arquivo `.plumb/changes/<id>.md`; aprovação antes do código e antes de entregar |
| **profunda** | Feature entre módulos, migração, contrato, auth/pagamento/dados pessoais | O mesmo arquivo + design com opções + revisão de segurança |

O arquivo da mudança é também o handoff: numa sessão nova, "continua o
PAY-142" retoma pelo Status e pelas tasks desmarcadas.

## Papéis

| Papel | Onde | Faz |
|---|---|---|
| Orquestrador | skill `plumb` (sessão principal) | Conversa, trilha, gates, estado; monta os prompts e delega |
| Explorador | `agents/plumb-explorer.md` | Responde perguntas sobre o código com `arquivo:linha` (só leitura) |
| Planejador | `agents/plumb-planner.md` | Critérios de aceite, tasks, design, perguntas (só leitura) |
| Implementador | `agents/plumb-implementer.md` | Uma task em TDD, só nos arquivos declarados |
| Verificador | `agents/plumb-verifier.md` | Prova independente: checks, critério → evidência, execução real |
| Revisor | `agents/plumb-reviewer.md` | Diff contra a spec: bugs com cenário de falha, escopo, convenções |
| Revisor de segurança | `agents/plumb-security.md` | Injeção, autorização, segredos, dados pessoais, dinheiro |
| Curador de contexto | `agents/plumb-curator.md` | Onde cada diretriz mora e o texto exato de regras e skills |

Os agentes de leitura usam `disallowedTools: Write, Edit, NotebookEdit` em
vez de uma lista fixa, para herdarem as ferramentas MCP que o projeto
instalar (navegador, Sentry, banco somente leitura). Skills não são
criadas por ferramenta — só por procedimento do projeto que combina passos
e ferramentas.

Subagentes não veem a conversa. Por isso todo despacho segue o contrato de
prompt (`skills/plumb/references/prompt-contract.md`): objetivo, contexto,
tarefa, restrições, critério de pronto e o que fazer se travar.

## Ferramentas

`skills/plumb-setup/references/catalog.md` cobre economia de tokens (RTK,
plugins LSP, Context7, statusline), tickets (gh, GitLab, Jira/Confluence,
Linear, Azure DevOps, Notion), documentação (Microsoft Learn, AWS, DeepWiki,
Mermaid), verificação de UI e mobile (Playwright CLI/MCP, Chrome DevTools,
axe, Maestro, mobile-mcp), design (Figma, Storybook), API (Hurl, OpenAPI,
Postman), dados somente leitura, nuvem e deploy, observabilidade (Sentry,
Grafana, Datadog), CI, segurança (Semgrep, Trivy, Snyk, GitGuardian,
SonarQube) e segredos. Cada linha liga um sinal no repositório a uma
habilidade, com o comando e o custo de contexto. Regras: sinal antes de
sugestão, CLI antes de MCP, no máximo 5, somente leitura por padrão, nada
sem o seu "sim". Entradas marcadas *(confirmar)* não foram verificadas na
documentação do fornecedor.

## Conhecimento do projeto

Não há banco de memória: o conhecimento vive nos arquivos que o próprio
Claude Code carrega.

| Diretriz | Destino | Carrega |
|---|---|---|
| Fato do projeto (comando, convenção) | `AGENTS.md` (bloco Plumb, ≤ 60 linhas) | Sempre |
| Regra de uma área | `.claude/rules/<tema>.md` com `paths:` | Ao tocar esses arquivos |
| Procedimento repetível | `.claude/skills/<nome>/` | Sob demanda |
| Preferência pessoal entre projetos | `~/.claude/skills/` ou `~/.claude/CLAUDE.md` | Sob demanda / sempre |

## Retroalimentação

1. **Sinais na hora:** cada regra enunciada, correção, gate rejeitado,
   travamento, retrabalho, procedimento repetível, padrão novo, fato velho
   ou lacuna de ferramenta vira uma linha na seção Retro do arquivo da
   mudança. Um `padrão novo` (o primeiro endpoint, a primeira migration)
   vira, no fechamento, uma regra com escopo apontando o arquivo criado
   como modelo — é assim que um projeto novo consolida as convenções. Regra
   enunciada vai ao curador na hora.
2. **No fechamento:** um único despacho do curador com todos os sinais; as
   propostas aparecem no gate 2 como "Aprendizados", com sim/não por item.
   Se a regra já existia e foi ignorada, o ajuste é reforçá-la, não
   duplicá-la.
3. **`/plumb-retro`** (sugerida a cada 5 mudanças): agrupa causas que se
   repetem, propõe até 5 ajustes com sinal-alvo e, na retro seguinte,
   confere se o sinal diminuiu — manter, reforçar ou reverter. Histórico em
   `.plumb/retro.md`.

## Custo

- `model` e `effort` por agente: explorador e verificador em `sonnet` com
  esforço baixo; implementador em `sonnet` (o orquestrador sobe para o
  modelo da sessão na trilha profunda ou depois de uma falha); planejador,
  revisores e curador no modelo da sessão com esforço alto.
- Planejamento sem subagente quando a área é pequena; tasks pequenas nos
  mesmos arquivos num só despacho.
- Retroalimentação com um despacho por mudança, não um por sinal; a retro
  lê só o cabeçalho e a seção Retro dos arquivos arquivados.
- Bloco de fatos com até 60 linhas e instruções de compactação.
- Medido nos evals: cada sessão do Claude Code começa com 35–70 mil tokens
  de contexto fixo, quase todo do próprio Claude Code e da sua configuração
  global. Confira o seu com `/context`.

## Recursos nativos usados

Skills e subagentes do Claude Code; `AGENTS.md` importado pelo `CLAUDE.md`;
regras com escopo (`.claude/rules/` + `paths:`); lista de tarefas da
sessão para o progresso; `permissions.ask` para push/PR; isolamento em
worktree para tasks paralelas; plan mode + ExitPlanMode para o gate 1
quando a sessão está em plan mode. Sem CLI, sem build, sem dependências.

**Limitação conhecida:** a regra `Bash(git push *)` não pega variações com
opções antes do subcomando (`git -c x=y push`). O gate 2 da skill continua
valendo nesses casos.

**Outras ferramentas** (Cursor, Codex…) recebem só o parágrafo de Workflow
que o `/plumb-setup` grava no `AGENTS.md`.

## Ideias de onde vieram

| Ideia | Origem |
|---|---|
| Triagem por tamanho e caminho leve para correções pequenas | BMAD Quick Flow, Kiro Quick Spec |
| Uma pasta de mudanças, arquivada ao concluir | OpenSpec |
| Perguntas limitadas, com respostas gravadas na spec | Spec Kit `/clarify` |
| Critérios de aceite prováveis (Dado/quando/então) | BDD |
| Evidência antes de dizer "pronto"; TDD; parar quando travar | Superpowers |
| Revisor com contexto limpo e veredito curto | Superpowers v6 |
| Arquivo de progresso, baseline e uma task por vez | Anthropic, *Effective harnesses for long-running agents* |
| Contexto fixo mínimo, o resto sob demanda | Kiro steering; Anthropic, *Effective context engineering* |

## Estrutura do repositório

```
skills/plumb/              orquestrador + references/ (contrato de prompt, modelo da mudança, testes)
skills/plumb-setup/        estruturação e auditoria do projeto + references/catalog.md
skills/plumb-retro/        retrospectiva periódica
agents/                    os 7 subagentes
evals/                     casos, resultados e um fixture sem dependências
```

## Desenvolvimento

Edite o markdown, rode de novo os casos afetados de `evals/cases.md` contra
`evals/fixture/` e registre em `evals/results.md`. Mantenha o
`skills/plumb/SKILL.md` com até ~300 linhas; o que só é preciso às vezes vai
para `references/`, com um nível só.

A versão 1 (CLI em TypeScript, 10 skills, memória Memanto/Obsidian, ciclo
"dream") está no histórico do git, antes do commit da v2.

## Licença

MIT