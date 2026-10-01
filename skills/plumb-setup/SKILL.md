---
name: plumb-setup
description: Estrutura ou audita o contexto de agentes de um repositório para o Plumb — descobre comandos, convenções e áreas sensíveis; propõe o bloco de fatos no AGENTS.md, o CLAUDE.md, regras com escopo em .claude/rules, skills de projeto e permissões de push/PR; e grava tudo depois de uma única aprovação. Rode uma vez por repositório, ou de novo quando comandos e convenções mudarem.
disable-model-invocation: true
---

# Plumb setup

Deixe o repositório pronto para que toda sessão futura comece sabendo o
que não dá para redescobrir barato — e nada além disso. Você conduz; a
exploração vai para `plumb-explorer`, a redação para `plumb-curator`.
Monte os prompts de delegação pelo contrato em
`../plumb/references/prompt-contract.md`.

Escreva tudo no idioma do usuário. Avise o progresso em uma linha por
etapa.

## 1 — Diagnóstico (só leitura)

Veja o que já existe: `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`,
`.claude/skills/`, `.claude/settings.json`, `.plumb/`. Classifique:

- **novo** — ainda não há código de produto (só README, licença, ou
  nada) → modo fundação (seção 1b).
- **vazio** — há código, mas nenhum desses arquivos → modo estruturação.
- **existente** — algum desses arquivos existe → modo auditoria.

Identifique também a(s) ferramenta(s) do time: a ferramenta em que você
está rodando, mais os sinais do repositório (`.claude/` → Claude Code,
`.cursor/` → Cursor). Se os sinais não decidem, inclua uma pergunta —
`O time usa Claude Code, Cursor ou os dois? Sugiro <o que os sinais indicam>.`
Passe a resposta ao curador: ele grava os arquivos de cada ferramenta.

Diga em uma linha qual é o caso, para qual ferramenta, e o que vem a seguir.

## 1b — Fundação (projeto novo)

Não há o que descobrir, então as decisões vêm do usuário. Pule a
exploração e entreviste as decisões de fundação — no máximo 6 perguntas
numa mensagem só (exceção ao limite de 4), cada uma com uma sugestão
baseada no que o usuário disse que o projeto vai ser. Se ele ainda não
disse, a primeira pergunta é essa.

1. Linguagem, runtime e framework.
2. Estrutura de pastas (por camada ou por feature).
3. Testes: runner e níveis (unitário, integração, E2E).
4. Padrão de API, erros e logs.
5. Persistência (banco, ORM, migrations).
6. CI, deploy e convenções de branch e commit.

Com as respostas, despache `plumb-curator` no modo fundação, escolha as
ferramentas pelo stack decidido (seção 2b, usando as decisões como sinais)
e siga para a seção 3. Não crie o esqueleto aqui: ele é a primeira
mudança, feita pelo fluxo normal. Feche sugerindo
`implementa o esqueleto do projeto` (trilha padrão).

## 2 — Exploração em paralelo

Despache até 4 `plumb-explorer` de uma vez, um por recorte (pule o que o
repositório claramente não tem). Repositório pequeno, que você cobre em
poucas leituras: explore você mesmo — despachar custaria mais que ler.

1. **Comandos:** testes (suíte e um único arquivo), lint, typecheck, build,
   como subir localmente — a partir de manifestos (`package.json`,
   `pyproject.toml`, `go.mod`, `pom.xml`, `Makefile`…) e da CI
   (`.github/workflows/`, `.gitlab-ci.yml`…), que é a fonte mais confiável.
2. **Convenções:** `git log --oneline -30` e nomes de branch recentes →
   formato de commit, de branch e de id de ticket; README e CONTRIBUTING.
   Este recorte precisa de `git`; se o explorador não tiver Bash, rode você
   mesmo e passe a saída no contexto.
3. **Mapa:** pastas de primeiro nível e de testes — onde vive cada coisa,
   em até 8 linhas.
4. **Áreas sensíveis e procedimentos:** auth, pagamento, dados pessoais,
   migrations, código gerado, vendorizado; scripts e pastas que indiquem
   procedimentos repetíveis (migrations, codegen, release).

No modo auditoria, acrescente ao contexto o conteúdo atual dos arquivos de
agente.

Sem git no diretório: pule o recorte 2 e avise.

## 2b — Ferramentas

Leia `references/catalog.md`. Veja o que já está instalado: no Claude
Code, `claude mcp list`; no Cursor, `.cursor/mcp.json` e `~/.cursor/mcp.json`. Cruze os sinais que a exploração trouxe (dependências,
remotes, CI, IaC, padrões de branch) com o catálogo e escolha **no máximo
5** ferramentas, seguindo as regras de escolha de lá — CLI antes de MCP,
priorizando o que fecha uma lacuna de verificação. Para cada uma, guarde o
sinal que a justifica, o comando e o custo de contexto.

Se a descoberta não respondeu onde ficam cards e documentação ou que
ferramentas o time usa, inclua as perguntas de entrevista do catálogo
(contam no limite de 4 perguntas).

## 3 — Proposta

Despache `plumb-curator` no modo do diagnóstico (estruturação, auditoria
ou fundação) com todos os achados ou respostas.
Revise o retorno: cada item tem evidência? O bloco de fatos tem até 60
linhas? Há algo que um agente descobriria sozinho em segundos? Corte.

Acrescente às perguntas do curador estas duas, se ainda não respondidas
(no máximo 4 perguntas no total; no modo fundação elas entram na pergunta
6 da entrevista):

1. Commitar ao fim de cada task, ou deixar os commits com você? — sugiro:
   commitar por task.
2. Versionar `.plumb/changes/` para que o revisor do PR veja a spec? —
   sugiro: sim.

Apresente tudo em **uma** mensagem:

```
**Plumb setup — <fundação | estruturação | auditoria>**
Arquivos:
- criar AGENTS.md — fatos do projeto (32 linhas) + workflow
- criar CLAUDE.md — @AGENTS.md
- criar .claude/rules/pagamentos.md — 3 regras, só para src/payments/**
- editar .claude/settings.json — confirmar push/PR e comandos destrutivos; bloquear force push e leitura de .env; liberar npm test e npm run lint

Ferramentas sugeridas:
- gh (CLI, custo 0) — remote github.com; issues, PRs e logs da CI
- Playwright CLI (custo 0) — front em Vite; verificar fluxos de UI
- Sentry (MCP, médio) — @sentry/node nas dependências; erros reais para reproduzir bugs

Perguntas:
1. ...

Aprova? (sim / ajustes / mostrar <arquivo> / só os arquivos / só as ferramentas)
```

Mostre o conteúdo completo de um arquivo só se o usuário pedir.

## 4 — Gravar (só depois do "sim")

1. **AGENTS.md** — insira ou substitua apenas o bloco entre
   `<!-- plumb:start -->` e `<!-- plumb:end -->`; o resto do arquivo fica
   intacto.
2. **CLAUDE.md** (Claude Code) — crie com `@AGENTS.md`, ou acrescente a
   linha se já existir sem ela.
3. **Regras e skills** — crie o que foi aprovado: `.claude/rules/*.md`
   (Claude Code), `.cursor/rules/*.mdc` (Cursor), `.claude/skills/` (as
   duas leem).
4. **Permissões** — mescle preservando todas as configurações e regras
   existentes: `.claude/settings.json` (`allow`, `ask`, `deny`) no Claude
   Code; `.cursor/cli.json` e `.cursor/permissions.json` no Cursor.
5. **`.plumb/changes/archive/`** — crie a pasta. Se o usuário não quer
   versionar as mudanças, acrescente `.plumb/changes/` ao `.gitignore`.
6. Registre as respostas no bloco de fatos (ex.: `commit por task: sim`).
7. **Ferramentas aprovadas** — instale com os comandos do catálogo. MCP no
   Claude Code: `claude mcp add --scope project` quando o time todo usa; no
   Cursor: acrescente a entrada em `.cursor/mcp.json` (tradução na regra 11
   do catálogo). As que exigem login OAuth: no Claude Code, `/mcp`; no
   Cursor, o botão de login em Settings → MCP. As que exigem instalador do
   sistema (`winget`, `brew`): rode se tiver permissão, senão mostre o
   comando. Confira (`claude mcp list`, ou o painel de MCP do Cursor) e registre cada uma no grupo
   "Ferramentas" do bloco de fatos, com uma linha de quando usar. Peça ao
   usuário para conferir o `/context` na próxima sessão.

Feche em 2–3 linhas: o que foi gravado e como começar
(`peça uma mudança, ex.: "implementa o PAY-142"`).

Em uma nova execução, grave só o que mudou e mostre o antes → depois.