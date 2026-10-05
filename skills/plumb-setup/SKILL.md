---
name: plumb-setup
description: Estrutura ou audita o contexto de agentes de um repositório para o Plumb — liga o projeto ao segundo cérebro (Knowledge OS), descobre comandos, convenções e áreas sensíveis, leva regras e skills de projeto existentes para o cérebro, propõe o bloco de comandos no AGENTS.md e as permissões de push/PR, e grava tudo depois de uma única aprovação. Rode uma vez por repositório, ou de novo quando comandos e convenções mudarem.
disable-model-invocation: true
---

# Plumb setup

Deixe o repositório pronto para que toda sessão futura comece sabendo o
que não dá para redescobrir barato — e nada além disso. O conhecimento vai
para o segundo cérebro (MCP `knowledge-os`); no repositório ficam só os
comandos e o Workflow no `AGENTS.md`, `.plumb/` e as permissões. Você
conduz; a exploração vai para `plumb-explorer`, a redação para
`plumb-curator`.
Monte os prompts de delegação pelo contrato em
`../plumb/references/prompt-contract.md`.

Escreva tudo no idioma do usuário. Avise o progresso em uma linha por
etapa.

## 1 — Diagnóstico (só leitura)

Veja o que já existe: `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`,
`.cursor/rules/`, `.claude/skills/`, `.claude/settings.json`, `.plumb/`,
e o cérebro: `context_get(project=".")`. Classifique:

- **novo** — ainda não há código de produto (só README, licença, ou
  nada) → modo fundação (seção 1b).
- **vazio** — há código, mas nenhum desses arquivos e o projeto não está
  ligado → modo estruturação.
- **com arquivos** — há regras, convenções ou skills de projeto em
  arquivos → modo migração (estruturação + levar o que existe ao cérebro).
- **ligado** — o cérebro já tem o projeto → modo auditoria.

**Cérebro.** Sem as ferramentas `knowledge-os` na sessão, ou com erro no
`context_get`: diga que o Plumb depende dele e como instalar
(`npx plumb-harness install` registra o servidor e o hook; precisa do
comando `knowledge-mcp`; o `npx plumb-harness status` diz o que falta) e pergunte se
segue assim mesmo: os itens vão para `.plumb/pending-brain.jsonl` e entram
no cérebro na primeira sessão com ele no ar.

**Ligação.** Projeto não ligado: inclua a pergunta
`Guardar o conhecimento em <Workspace> / <Domain>? Sugiro <dono do remote ou cliente> / <nome do repositório>.`
— projetos do mesmo cliente ou empresa no mesmo workspace compartilham o
domain `Geral` (convenções comuns).

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

Com as respostas, despache `plumb-curator` no modo fundação (com o
workspace e o domain), escolha as
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

Nos modos migração e auditoria, acrescente ao contexto o conteúdo atual
dos arquivos de agente (migração) ou o pacote do cérebro (auditoria).

Sem git no diretório: pule o recorte 2 e avise.

## 2b — Ferramentas

Leia `references/catalog.md`. Veja o que já está instalado: no Claude
Code, `claude mcp list`; no Cursor, `.cursor/mcp.json` e `~/.cursor/mcp.json`. Cruze os sinais que a exploração trouxe (dependências,
remotes, CI, IaC, padrões de branch) com o catálogo e escolha **no máximo
5** ferramentas, seguindo as regras de escolha de lá — CLI antes de MCP,
priorizando o que fecha uma lacuna de verificação. Para cada uma, guarde o
sinal que a justifica, o comando e o custo de contexto.

Sinal forte sem entrada no catálogo (uma tecnologia que o projeto usa e
nenhuma linha cobre): procure com a skill `plumb-find-skills`, que exige
revisão de segurança e o seu "sim" antes de instalar qualquer coisa.

Se a descoberta não respondeu onde ficam cards e documentação ou que
ferramentas o time usa, inclua as perguntas de entrevista do catálogo
(contam no limite de 4 perguntas).

## 3 — Proposta

Despache `plumb-curator` no modo do diagnóstico (estruturação, migração,
auditoria ou fundação) com todos os achados ou respostas, o workspace e o
domain, e o caminho absoluto de `references/permissions.md` (desta skill).
Não leia o arquivo do curador antes de despachar.
Revise o retorno: cada item tem evidência e `summary` que se segue sem o
`content`? O bloco do `AGENTS.md` tem até 20 linhas e só comandos? Há algo
que um agente descobriria sozinho em segundos? Corte.

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
Cérebro: Polara / projpro — 7 itens (rascunho)
- contexto/projeto — stack, mapa, áreas sensíveis
- regra/money — valores em Money, só em src/payments/**
- proc/migration — criar e rodar migration (veio de .claude/skills/migration)
- ...

Arquivos:
- criar AGENTS.md — comandos (14 linhas) + workflow
- criar CLAUDE.md — @AGENTS.md
- remover .claude/rules/pagamentos.md — migrado para regra/money
- editar .claude/settings.json — confirmar push/PR e comandos destrutivos; bloquear force push e leitura de .env; liberar npm test, npm run lint e o cérebro

Ferramentas sugeridas:
- gh (CLI, custo 0) — remote github.com; issues, PRs e logs da CI
- Playwright CLI (custo 0) — front em Vite; verificar fluxos de UI
- Sentry (MCP, médio) — @sentry/node nas dependências; erros reais para reproduzir bugs

Perguntas:
1. ...

Aprova? (sim / ajustes / mostrar <arquivo ou key> / só o cérebro / só as ferramentas)
```

Mostre o conteúdo completo de um arquivo só se o usuário pedir.

## 4 — Gravar (só depois do "sim")

1. **Cérebro** — `project_link(project=".", workspace, domain)` e depois o
   lote do curador numa chamada: `item_save(project=".", items=[...])`.
   Erro aponta a entrada: corrija e grave de novo. Cérebro fora do ar:
   uma entrada por linha em `.plumb/pending-brain.jsonl` e avise que a
   ligação fica para `knowledge-mcp link --project . --workspace <W> --domain <D>`.
   Só remova arquivos migrados depois que o lote gravar.
2. **AGENTS.md** — insira ou substitua apenas o bloco entre
   `<!-- plumb:start -->` e `<!-- plumb:end -->`; o resto do arquivo fica
   intacto. Conteúdo migrado fora do bloco: remova só o que o usuário
   aprovou.
3. **CLAUDE.md** (Claude Code) — crie com `@AGENTS.md`, ou acrescente a
   linha se já existir sem ela.
4. **Arquivos migrados** — remova as regras e skills de projeto que foram
   para o cérebro e cuja remoção foi aprovada.
5. **Permissões** — mescle preservando todas as configurações e regras
   existentes: `.claude/settings.json` (`allow`, `ask`, `deny`) no Claude
   Code; `.cursor/cli.json` e `.cursor/permissions.json` no Cursor.
6. **`.plumb/changes/archive/`** — crie a pasta e acrescente
   `.plumb/pending-brain.jsonl` ao `.gitignore`. Se o usuário não quer
   versionar as mudanças, acrescente também `.plumb/changes/`.
7. Registre as respostas na linha `Convenções do Plumb:` do bloco do `AGENTS.md`
   (ex.: `commit por task: sim · .plumb/changes versionado: sim`) — não no cérebro.
8. **Ferramentas aprovadas** — instale com os comandos do catálogo. MCP no
   Claude Code: `claude mcp add --scope project` quando o time todo usa; no
   Cursor: acrescente a entrada em `.cursor/mcp.json` (tradução na regra 11
   do catálogo). As que exigem login OAuth: no Claude Code, `/mcp`; no
   Cursor, o botão de login em Settings → MCP. As que exigem instalador do
   sistema (`winget`, `brew`): rode se tiver permissão, senão mostre o
   comando. Confira (`claude mcp list`, ou o painel de MCP do Cursor) e registre cada uma no grupo
   "Ferramentas" do bloco do AGENTS.md, com uma linha de quando usar. Peça ao
   usuário para conferir o `/context` na próxima sessão.

Feche em 2–3 linhas: o que foi gravado (arquivos e quantos itens no
cérebro) e como começar
(`peça uma mudança, ex.: "implementa o PAY-142"`).

Em uma nova execução, grave só o que mudou e mostre o antes → depois.