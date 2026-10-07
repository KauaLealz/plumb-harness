---
name: plumb-setup
description: Estrutura ou audita o contexto de agentes de um repositório para o Plumb — liga o projeto ao segundo cérebro (Knowledge OS), descobre comandos, convenções e áreas sensíveis, leva regras e skills de projeto existentes para o cérebro, propõe o bloco de comandos no AGENTS.md e as permissões de push/PR, e grava tudo depois de uma única aprovação. Rode uma vez por repositório, ou de novo quando comandos e convenções mudarem.
disable-model-invocation: true
---

# Plumb setup

**Desde a primeira mensagem, no idioma do usuário** (o da conversa ou das
instruções globais; com o pedido só no comando, nunca troque para o inglês).

Deixe o repositório pronto para que toda sessão futura comece sabendo o
que não dá para redescobrir barato — e nada além disso. O conhecimento vai
para o segundo cérebro (MCP `knowledge-os`); no repositório ficam só os
comandos e o Workflow no `AGENTS.md` e as permissões — nenhuma pasta do Plumb. Você
conduz; a exploração vai para `plumb-explorer`, a redação para
`plumb-dreamer`.
Monte os prompts de delegação pelo contrato em
`../plumb/references/prompt-contract.md`.

**Como falar.** Do início à proposta, **no máximo três mensagens curtas**, e
cada uma diz **o que você descobriu no repositório** — nunca o que vai fazer a
seguir dentro deste fluxo (ler um arquivo, despachar alguém, revisar um retorno):
`Este repositório já tem regras em .claude/rules e no CLAUDE.md — vou levá-las para o segundo cérebro e deixar os arquivos enxutos.`
Nunca no chat: o nome dos modos ("estruturação", "migração", "auditoria",
"fundação"), dos subagentes ("curador", "explorador") e das seções desta skill;
"vou despachar…", "o curador retornou", "leio o contrato", "revisei: cada item
tem evidência…" — essas etapas são silenciosas. Para o usuário: `Montei a proposta.`

**Decidir, não perguntar.** Decida o que o repositório, o cérebro, as
instruções e a conversa sustentam e mostre em "Decidi:", com a fonte — o usuário
revisa a proposta inteira de uma vez. Pergunta só na exceção da seção "Decidir,
não perguntar" de `../plumb/SKILL.md` (não existe em lugar nenhum e é caro errar),
com a sua recomendação. Não invente dúvida que nada no repositório levantou.

## 1 — Diagnóstico (só leitura)

Veja o que já existe: `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`,
`.cursor/rules/`, `.claude/skills/`, `.claude/settings.json`, uma pasta `.plumb/` de
versões antigas (os planos dela migram para o cérebro como itens `spec`),
e o cérebro: `context_get(repo=".")`. Classifique:

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
segue assim mesmo: os itens vão para `~/.knowledge-os/pending.jsonl` e entram
no cérebro na primeira sessão com ele no ar.

**Ligação.** Projeto não ligado: antes de inventar um workspace novo, procure um
já existente que sirva — `item_search(everywhere=true, query="<nome do dono ou da
empresa no remote>")`. A busca devolve o `project` de cada achado, nunca o
`workspace` (a ferramenta não lista workspaces) — um project com nome parecido ao
de outro repo seu é só um indício, não prova. Achou indício: proponha em
"Decidi:" o workspace candidato (ex.: "parece a mesma empresa do project
`usequittar`") para o usuário confirmar, em vez de assumir ou de criar um
segundo workspace a partir do nome cru do repositório — um nome inventado sem
essa checagem vira duplicata silenciosa (já aconteceu: `ai8-algoritimo-
imobiliario` ao lado do `AI8` correto, por um repo cujo project real,
`usequittar`, já vivia em `AI8`). Sem nenhum indício, aí sim é o primeiro repo
daquele dono: workspace = o nome do dono no remote (sem remote, `Pessoal`).
Project = nome do repositório. Proponha sempre em "Decidi:" o workspace escolhido
e a fonte (achado candidato a confirmar, ou novo porque a busca não achou nada)
— assim o usuário percebe um nome errado antes da gravação, não depois.
No primeiro repo de um dono, também proponha em "Decidi:" um nome legível para o
workspace (`polara-innovations` → `Polara`; a conta pessoal do usuário →
`Pessoal`) e passe-o no `repo`. Ao migrar regras antigas: o que vale para
os repos daquele
contexto vai para o project `Geral` do workspace; o que vale para o usuário em
qualquer lugar (idioma, estilo, ambiente da máquina) vai para o workspace `Global`.

Identifique também a(s) ferramenta(s) do time: a ferramenta em que você
está rodando, mais os sinais do repositório (`.claude/` → Claude Code,
`.cursor/` → Cursor). Se os sinais não decidem, inclua uma pergunta —
`O time usa Claude Code, Cursor ou os dois? Sugiro <o que os sinais indicam>.`
Passe a resposta ao curador: ele grava os arquivos de cada ferramenta.

Diga em uma linha, em linguagem de resultado, o que encontrou e o que vai fazer.

## 1b — Fundação (projeto novo)

Não há código para ler, então **proponha** as decisões de fundação a partir do
que o usuário disse que o projeto vai ser (no pedido, na conversa, no README) e
das preferências dele no workspace `Global` — cada uma com o porquê — e ele
revisa a lista inteira na proposta. Só se ele ainda não disse o que o projeto é,
essa é a única pergunta antes de propor. Os temas:
1. Linguagem, runtime e framework.
2. Estrutura de pastas (por camada ou por feature).
3. Testes: runner e níveis (unitário, integração, E2E).
4. Padrão de API, erros e logs.
5. Persistência (banco, ORM, migrations).
6. CI, deploy e convenções de branch e commit.

Com as respostas, despache `plumb-dreamer` no modo fundação (com o
workspace e o project), escolha as
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

Onde ficam os cards e que ferramentas o time usa: decida pelos sinais (remote
GitHub → GitHub Issues e `gh`; ids `ABC-123` em commits com link do Jira → Jira) e
liste em "Decidi:". Sem sinal nenhum, não sugira ferramenta de tickets.

## 3 — Proposta

Despache `plumb-dreamer` no modo do diagnóstico (estruturação, migração,
auditoria ou fundação) com todos os achados ou respostas, o workspace e o
project, e os caminhos absolutos de `references/permissions.md` (desta skill) e
de `../plumb/references/brain-items.md` (o molde dos itens).
Não leia o arquivo do curador antes de despachar.
Confira o retorno **em silêncio** (nada disso vai para o chat) e corte o que
falhar: item sem evidência, `summary` que não se segue sem o `content`, bloco do
`AGENTS.md` com mais de 20 linhas ou com algo além de comandos, coisa que um
agente descobriria sozinho em segundos.

Junte as decisões do curador às suas num só "Decidi:". Commits: se o `git log`
ou o usuário não dizem o contrário, decida "um commit por parte pronta da
mudança, em branch própria" — fonte: o histórico fica revisável — e liste.

Apresente tudo em **uma** mensagem, com o título exatamente neste formato (sem o
nome do modo, da ferramenta ou de etapas):

```
**Preparar o agenda-api para o Plumb**

O que vou guardar no segundo cérebro (Polara › agenda-api) — 5 itens:
- Como o projeto é: Node 20, sem dependências, pagamentos em `src/server.js`
- Valores sempre em centavos inteiros (vale em `src/payments`)
- Erros sempre no formato `{ error: string }`
- Como criar e rodar uma migração (veio de `.claude/skills/migration`)
- ...

O que muda nos arquivos:
- `AGENTS.md` novo, só com os comandos (testes, um teste só, subir local)
- `CLAUDE.md` passa a apontar para o `AGENTS.md`
- `.claude/rules/pagamentos.md` sai — as regras dele foram para o cérebro
- `.claude/settings.json`: push, PR e comandos destrutivos pedem confirmação;
  `.env` fica bloqueado; testes e lint rodam sem perguntar

Ferramentas que eu sugiro:
- `gh` (já instalado) — ver issues, PRs e logs da CI do GitHub
- Playwright — conferir telas do front em Vite de verdade

Decidi (revise o que não fizer sentido):
- Guardar em `Polara › agenda-api` — o remote é da polara-innovations; os outros repos da Polara caem no mesmo workspace e dividem o `Geral`.
- "Commits no formato PAY-<n>" vai para `Polara › Geral` — vale nos repos da empresa.
- "Respostas em PT-BR" vai para o Global — vale em todo projeto.
- Um commit por parte pronta, em branch própria — não achei convenção no git log.

Posso aplicar? (sim / ajuste qualquer item acima)
```

Mostre o conteúdo completo de um arquivo só se o usuário pedir.

## 4 — Gravar (só depois do "sim")

1. **Cérebro** — `repo(action="link", repo=".", workspace=<W>, project=<P>)` e depois o
   lote do curador numa chamada: `item_save(repo=".", items=[...])`.
   Erro aponta a entrada: corrija e grave de novo. Cérebro fora do ar:
   uma entrada por linha em `~/.knowledge-os/pending.jsonl` (com `project`) e avise que a
   ligação fica para `knowledge-mcp link --repo . --workspace <W> --project <P>`.
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
6. **`.plumb/` de versões antigas** — mudanças em andamento viram itens
   `mudanca/<id>` (`type: spec`, o arquivo como `content`); as arquivadas, o mesmo
   com `status: done`; o `dream.md`, o item `dream/last`. Depois que o lote
   gravar, remova a pasta e a linha dela no `.gitignore`.
7. Registre a resposta sobre commits na linha `Convenções do Plumb:` do bloco do
   `AGENTS.md` (ex.: `commit por tarefa: sim`) — não no cérebro.
8. **Ferramentas aprovadas** — instale com os comandos do catálogo. MCP no
   Claude Code: `claude mcp add --scope project` quando o time todo usa; no
   Cursor: acrescente a entrada em `.cursor/mcp.json` (tradução na regra 11
   do catálogo). As que exigem login OAuth: no Claude Code, `/mcp`; no
   Cursor, o botão de login em Settings → MCP. As que exigem instalador do
   sistema (`winget`, `brew`): rode se tiver permissão, senão mostre o
   comando. Confira (`claude mcp list`, ou o painel de MCP do Cursor) e registre cada uma no grupo
   "Ferramentas" do bloco do AGENTS.md, com uma linha de quando usar. Peça ao
   usuário para conferir o `/context` na próxima sessão.

Feche em 2–3 linhas, em linguagem de resultado: o que ficou pronto (arquivos e
o que foi guardado no cérebro) e como começar
(`Pronto. Agora é só pedir uma mudança — por exemplo, "implementa o PAY-142".`).

Em uma nova execução, grave só o que mudou e mostre o antes → depois.