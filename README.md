# Plumb

Harness de desenvolvimento **fullstack** e **spec-driven** para agentes de código no Claude Code e
no Cursor, com memória de longo prazo em arquivos. Peça qualquer coisa — uma pergunta,
`"implementa o PAY-142"`, `"corrige o bug do login"`, `"faz a migração"` — e o Plumb **dimensiona o
trabalho por um score de complexidade**, consulta o que o projeto já aprendeu, entrevista você até os
dois terem o mesmo entendimento, escreve uma spec que você aprova, constrói em TDD num worktree
próprio, prova no nível certo e pergunta antes de qualquer coisa sair da sua máquina.

Você decide **o que será construído** e **o que será entregue**. O resto é com o agente, que te
mantém informado pelo chat e pela lista de tarefas da sessão.

O que se aprende no caminho — convenções, decisões e o porquê, procedimentos, armadilhas — vai para
um **segundo cérebro em arquivos** (`.plumb/knowledge/`), e cada sessão nova começa com o resumo do
que importa daquele projeto já no contexto. **Tudo funciona com e sem o cérebro.**

## Princípios

1. **Todo pedido passa pelo Plumb**, roteado por situação (um hook lembra a cada mensagem).
2. **Cerimônia proporcional ao score (1–10):** o trivial corrige direto; o maior passa por grill,
   spec e aprovação.
3. **Ciclo de vida completo** (código, testes, deploy, banco, filas, observabilidade) como cidadão de
   primeira classe — a expertise mora nos playbooks das skills.
4. **Prova antes de pronto**, no nível certo pela natureza (nunca só teste unitário).
5. **O harness se retroalimenta** (learn + reflect + proposta de novas skills).
6. **Funciona com e sem o cérebro** — ele é uma camada de conhecimento, não uma dependência.
7. **Adapta-se ao dev/empresa:** tudo que o harness formata é um default sobrescrevível.

## Instalação

Pacote npm, sem dependências (Node 18+). Instala globalmente as skills, os subagentes, a instrução
que faz qualquer sessão reconhecer o Plumb e os hooks de entrada. **Não há MCP a registrar** — o
segundo cérebro são arquivos.

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
| Instrução global | bloco em `~/.claude/CLAUDE.md`, entre marcadores | o instalador imprime o texto para colar em Settings → Rules → User Rules |
| **Entrada** | hooks em `~/.claude/settings.json`: `UserPromptSubmit` (roteador + triagem em **toda** mensagem), `SessionStart` (pacote do `.plumb/knowledge` + aviso da sessão anterior) e `Stop` (rede de segurança) | hook `sessionStart` em `~/.cursor/hooks.json` (o Cursor não injeta contexto por prompt) |

Outros comandos:

```bash
npx plumb-harness status                 # versões instaladas e hooks
npx plumb-harness install --both         # atualizar: rode o install de novo
npx plumb-harness uninstall --claude     # remove skills, agentes, instrução e hooks (os arquivos .plumb/ ficam)
npx plumb-harness install --both --project   # só no projeto atual (.claude/, .cursor/)
```

Depois, uma vez por repositório:

```
/plumb-init
```

Gera a pasta `.plumb/`, escreve o bloco de comandos no `AGENTS.md`, entrevista você (adaptativo,
mostrando o que inferiu com a evidência), e sugere MCPs e competências pelos sinais do código —
incluindo os MCPs de ciclo de vida (banco, filas, observabilidade, deploy) e o `knowledge-os` como
acelerador opcional. Nada se instala sem o seu "sim". Três modos: projeto novo, brownfield (migra
regras em arquivo para o `.plumb/`) e auditoria.

## Como funciona

```
pedido → rota → [triagem: score] → explore → [grill] → [spec: você aprova] → code (waves) → qa + review → learn → [você decide push/PR/merge] → ship
```

**Sem orquestrador: coreografia.** O modelo classifica o pedido pela regra do hook, calcula um
**score de complexidade**, carrega a skill da situação, e **cada skill aponta a próxima**. A **spec é
o estado** — o que foi feito e o que falta.

| Score | Trilha | Roda |
|---|---|---|
| 1–2 | direta | sem grill/spec: corrige, roda os checks, reporta |
| 3–5 | padrão | grill → spec (aprovação) → worktree → code → qa + review → learn → ship |
| 6–8 | profunda | + design na spec, lente de segurança, EARS no crítico, spec-lint estrito |
| 9–10 | programa | + longa duração: `feature_list`, progresso, `init.sh`, verificação E2E, waves |

Não existe "um fluxo": pergunta → `plumb-ask`; documentação → `plumb-document`; regra ditada →
`plumb-learn`. Entregáveis não-código são de primeira classe.

## As skills

Cada skill é **`SKILL.md`** (o procedimento, enxuto) + **`playbook.md`** (a expertise: "como fazer
bem"). O ciclo de vida de cada área (migração, fila, deploy…) vive **em fatias** dentro dos playbooks
das skills onde é útil — não há playbook central por área. Toda skill é **chamável sozinha**.

| Skill | Faz |
|---|---|
| `plumb-ask` | pergunta, explicação ou investigação (só leitura; escala do simples ao diagnóstico) |
| `plumb-grill` | entrevista até o entendimento; o agente decide rodadas/temas/perguntas |
| `plumb-spec` | escreve a spec (`.plumb/work/<id>.md`), com spec-lint e gate de aprovação |
| `plumb-code` | implementa as fases/waves no worktree, em TDD |
| `plumb-qa` | prova que funciona, no nível certo pela natureza (nunca só unitário) |
| `plumb-review` | lê o diff em dois eixos (fidelidade à spec + correção) e **só reporta** |
| `plumb-learn` | grava o que dura; captura o ditado na hora; propõe novas skills |
| `plumb-ship` | rodada final, depois push/PR/merge e limpeza, com o "sim" |
| `plumb-plan` | desenha sem construir (explore+grill+spec, para antes do código) |
| `plumb-document` | documenta o comportamento atual, para humanos, no repositório |
| `plumb-init` | prepara o repositório (gera `.plumb/`, `AGENTS.md`, sugere ferramentas) |
| `plumb-reflect` | retro da sessão inteira; audita o `.plumb/knowledge/` |
| `plumb-find-docs` | doc atual de uma biblioteca (Context7), antes de codar |
| `plumb-find-mcps` | falta acesso a um sistema? acha ou cria um MCP |
| `plumb-find-skills` | falta uma competência? acha ou cria uma skill |

O primitivo **`explore`** (leitura com subagentes em paralelo) é usado por dentro das skills, não é
chamável. Os subagentes ficam em `agents/` (explorer, implementer, tester, reviewer, planner).

## Segundo cérebro (arquivos, estilo Obsidian)

Markdown livre, **sem tipos fixos e sem schema**, em duas camadas:

```
.plumb/knowledge/        do projeto (commitado no repo; o time compartilha)
  rules.md               regras e convenções globais do projeto
  <área>/<item>.md       um arquivo por item, agrupado por assunto
~/.plumb/knowledge/      global/pessoal (idioma, estilo, preferências)
```

O agente vê **global + projeto atual**, lê os arquivos direto, e funciona igual se a pasta não
existir. Cada nota tem um `summary:` no frontmatter — o `SessionStart` carrega **só os resumos**; o
corpo entra sob demanda. Uma regra que o usuário **dita** grava na hora; o que o agente **infere**
pede o "sim". **Override:** uma convenção do dev/empresa no `.plumb/knowledge/` **vence** o default
do harness (precedência projeto → global → default).

**Preferências por skill.** Cada skill mantém você no loop: explora primeiro, mas **na dúvida
pergunta** o que precisa para fazer certo (ex.: a `qa` — o que testar, onde roda, onde estão os
cenários, o formato do entregável) e **nunca adivinha fato operacional**. Após cada resposta, passa
pelo `plumb-learn` para gravar o que durar em `.plumb/knowledge/preferences/<skill>.md` (global para
você, projeto para o time) — e na próxima vez já sabe, sem reinterrogar. Detalhe em
`references/preferences.md`.

A **spec e o estado de execução não ficam no cérebro** — são `.plumb/work/<id>.md`, commitado na
branch da mudança e removido no merge. Com um gestor de tarefas conectado (Jira/Linear/GitHub
Issues), o card é o **quê + status**; o `.plumb/knowledge/` guarda o **porquê**.

Quem quiser busca/ranking/UI por cima dos mesmos arquivos pode instalar o `knowledge-os` (opcional),
sugerido pelo `plumb-init`/`plumb-find-mcps`.

## Cursor

O fluxo, os papéis, os gates e o cérebro são os mesmos. O que muda é onde cada coisa é gravada — o
`/plumb-init` detecta a ferramenta (ou pergunta) e gera os arquivos certos. **Limitações:** sem hook
por prompt nem `Stop` que injete contexto, a entrada depende do `sessionStart`; os agentes não usam
`readonly`; paralelismo em worktree não é garantido.

## Estrutura do repositório

```
skills/plumb/              núcleo: hooks/entry.mjs + references/ (knowledge-model, triage, spec-template, worktrees, prompt-contract, communication, parallel, testing, task-manager)
skills/plumb-<nome>/       cada skill: SKILL.md + playbook.md
skills/plumb-find-*/       cópias de terceiros adaptadas (SOURCE.md / LICENSE.upstream)
agents/                    os 5 subagentes
docs/                      plumb-v7-blueprint.md (desenho) e plumb-v7-decisions.md (log de decisões)
bin/cli.js, lib/           instalador npm (install, uninstall, status; registra os hooks de entrada)
scripts/run-tests.mjs      roda os testes sem depender de glob do shell
test/                      testes do instalador, do hook de entrada, do contrato v7 e do extrator (npm test)
global-instruction.md      bloco gravado em ~/.claude/CLAUDE.md (ou User Rules do Cursor)
```

## Desenvolvimento

Edite o markdown; `npm test` roda o instalador, o hook de entrada (roteador + pacote do `.plumb`), o
contrato v7 (sem resquícios do v6, estrutura SKILL+playbook, skills invocáveis pelo modelo) e o
extrator do reflect. O desenho completo e as decisões estão em `docs/`.

## Licença

MIT
