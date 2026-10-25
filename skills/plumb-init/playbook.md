# Playbook do init — como preparar bem o repositório

A expertise do `plumb-init`: os três modos, as dimensões da entrevista com evidência, o layout do
`.plumb/`, o que vira regra vs skill, a captura do modelo da empresa e o bloco do `AGENTS.md`.

**Regra de ouro:** só é achado o que tem **evidência direta no repositório** (arquivo, comando, linha
do `git log`), e todo achado é mostrado com a evidência e **confirmado** antes de virar nota.
Interpretação — o porquê, a intenção, a preferência, a regra de negócio — é **pergunta**, nunca
dedução. O que um agente redescobre em segundos lendo o código **não vira nota**.

## Os três modos (auto-detectados)

Olhe `AGENTS.md`, `CLAUDE.md`, `.plumb/`, `.claude/rules/`, `.cursor/rules/`, skills de projeto e se
há código de produto. Classifique:

- **Projeto novo** — ainda não há código de produto (só README, licença, ou nada). As dimensões de
  código (mapa, convenções, procedimentos) viram **propostas de base, não inferência**: a partir do
  que o usuário diz que o projeto vai ser, proponha cada decisão **com o porquê e a alternativa
  descartada** (linguagem, runtime e framework; estrutura de pastas; testes; padrão de API/erros/log;
  persistência; CI, deploy e convenção de branch/commit). Cada decisão vira uma nota em
  `.plumb/knowledge/` com `## Por quê` e `## Alternativa descartada`. **Não crie o esqueleto do
  código** — ele é a primeira mudança, pelo fluxo normal.
- **Brownfield** — já há regras, convenções ou skills de projeto **em arquivos** (`.claude/rules/`,
  `.cursor/rules/`, `AGENTS.md`, `CLAUDE.md`, skills). **Migre** cada uma para a dimensão a que
  pertence no `.plumb/knowledge/` e **enxugue**: reescreva (não transcreva) — tire número de linha, id
  de tarefa e menção a arquivo que a própria migração vai apagar. Divergência entre `.claude/rules/x`
  e `.cursor/rules/x` vira **pergunta** (as duas versões como opções). Skill que é só texto vira nota;
  skill com scripts de verdade **continua skill** (não migra). Depois de gravadas, pergunte se remove
  os arquivos antigos (recomendação: remover).
- **Já-configurado** — já existe `.plumb/knowledge/`. É **auditoria**: cada dimensão começa pelo que o
  cérebro já tem, confronta com o código e pergunta só a diferença (`a nota X diz Y, o código tem Z —
  qual vale?`; `este howto cita um comando que não existe mais`). Atualize pelo mesmo arquivo, marque
  o obsoleto, junte duplicatas. Pergunte o que mudou desde o último init (time, ferramentas, regras).

## O layout do `.plumb/` (esqueleto + seed)

Primeiro o **esqueleto**, depois o **seed** (só o confirmado). Modelo completo em
`../plumb/references/knowledge-model.md`.

```
.plumb/knowledge/
  rules.md            regras e convenções globais do projeto (poucas, densas)
  <área>/             uma pasta por assunto/área QUANDO o volume pede (2+ itens)
    <item>.md         um arquivo por item (uma decisão, uma pegadinha, um howto)
```

- Comece com `rules.md`; crie subpasta de área só quando houver **2+ itens** do tema. Nada de pasta
  com 0–1 item.
- Garanta o **global** `~/.plumb/knowledge/` (mesmo formato) se não existir — é onde mora o
  pessoal/transversal (idioma, estilo, preferências). Tudo no global **pede o "sim"** (vale em todo
  projeto do usuário).
- **Cada nota:** frontmatter `summary:` (1–2 frases **com o porquê**) + corpo (o porquê, a alternativa
  descartada, o exemplo, a pegadinha, com `arquivo:símbolo`). `tags` livres (área + nuance). O seed
  grava **cada item com a evidência** no corpo.
- O `.plumb/` é **commitado no repo** (o time compartilha). A spec de trabalho (`.plumb/work/`) é
  outra coisa — não é assunto do init.

## As dimensões da entrevista (decididas pelo repo)

Não há lista fixa obrigatória — você decide as dimensões e a ordem pelo que o repo **não** respondeu.
Estas são as fontes de ramo; pode cada uma que a exploração já fechou:

| Dimensão | Explora (evidência) | Pergunta (só o que o repo não responde) | Vira nota em |
|---|---|---|---|
| **Produto/domínio** | README, docs, nomes de pastas/entidades, rotas | Para quem é? Termos próprios do domínio? Regra que um dev novo erraria? O que **não** é escopo? | `rules.md` / `produto/` |
| **Stack/ambiente** | manifestos, lockfiles, `docker-compose`, CI, `.env.example` (só nomes) | Roda onde? Serviço que o código não mostra (banco gerenciado, fila, terceiro)? Versão de runtime real? | `stack/` |
| **Mapa do código** | pastas de 1º nível, testes, módulos mais importados | O que é legado/vendorizado (não tocar)? Qual é o "coração"? Pasta com nome que engana? | `mapa.md` |
| **Convenções** | `git log --oneline -30`, branches, linter/formatter, `CONTRIBUTING`, código vizinho | A convenção de commit/branch é regra ou acidente? Formato de erro/log? Algo que a revisão sempre cobra? | `rules.md` |
| **Áreas sensíveis** | SDKs de auth/pagamento, pastas `auth`/`payments`, migrations, PII, `tenant_id` | Cobra dinheiro, por onde? Como autentica/autoriza? Que PII circula? Isolamento entre clientes? | `seguranca/` (liga a lente de segurança do review) |
| **Procedimentos** | `scripts/`, `migrations/`, geradores, release no CI | Processo que vive só na cabeça de alguém (release, deploy, rotação de chave, repro de bug em prod)? | `howto` ou **skill** (ver abaixo) |
| **Ferramentas/acessos** | `claude mcp list`, `.mcp.json`, `.cursor/mcp.json`, SDK de observabilidade, ORM, IaC | Onde ficam os cards? Como veem o erro em produção? Pode olhar dado real (leitura)? Há E2E? | varredura (abaixo) |
| **Time/fluxo** | `CODEOWNERS`, template de PR, ids de ticket, CI | Quem revisa/aprova? O que é "pronto"? Precisa avisar alguém ao entregar? Janela de release? | `rules.md` |
| **Preferências** | `~/.claude/CLAUDE.md`, global existente, idioma da conversa | Só o que **falta**: idioma, tom, como avisar, o que nunca fazer sem perguntar | **global** `~/.plumb/knowledge/` (pede o "sim") |

Formato de cada pergunta e das rodadas: `../plumb-grill/playbook.md`. Mostre os achados primeiro
(`multiSelect` "quais destes estão certos?", "todos" recomendado quando a evidência é forte); o que
o usuário responder "não usamos / não sei / pula" **é informação** — registre para a próxima sessão
não perguntar de novo.

## Capturar o modelo da empresa/dev (override)

Tudo que o harness formata é um **default sobrescrevível**. Explore docs/PRs/evidências e **grile**
estas quatro, cada uma com a recomendação pelo que os sinais indicam:

1. **Template de doc** — tem um padrão de README/ADR/doc de feature? (olhe `docs/`, ADRs, PRs antigos)
2. **Formato de evidência** — como o time prova que algo funciona? (screenshot? saída de teste colada
   no PR? link de CI?) → vira regra que o `plumb-qa` segue.
3. **Definição de pronto** — o que conta como "feito" aqui? (checklist de PR, gates de CI)
4. **Convenção de PR/commit** — conventional commits? título por ticket? template de corpo de PR?

**Onde grava:** se é **formato/convenção declarativa** (sempre-ligada, ajusta como as skills agem) →
**regra** em `.plumb/knowledge/`. Se é um **processo com passos** (ex.: o rito de release da empresa)
→ **skill**, proposta via `plumb-find-skills` (guardada, com o "sim"). O critério está abaixo.

## Regra vs skill (o critério)

- **Regra** (`.plumb/knowledge/`): restrição/convenção/preferência **declarativa**, sempre-ligada, que
  ajusta como as skills do Plumb agem — "evidência inclui screenshot", "conventional commits", um
  template que é só **formato**. Entra pela precedência projeto → global → default.
- **Skill** (via `plumb-find-skills`, guardada): **capacidade/procedimento invocável** com passos
  próprios — o processo de release da empresa, um gerador de relatório, um template que é um
  **processo**. Criada quando a empresa precisa; nada se instala sem o "sim".

Na dúvida: se o agente **segue** a coisa passivamente em toda mudança, é regra; se ele **executa** a
coisa quando chamada, é skill.

## A varredura de ferramentas (por sinais)

Faça as três varreduras **antes** de perguntar; cada lacuna vira uma recomendação. Nada se instala
sem o "sim"; até 5 por rodada, cada opção com o **sinal citado** (arquivo/linha, dependência, link) e
o custo de contexto. Leia antes o que já foi **recusado** (não repita).

- **(a) Docs atuais → `plumb-find-docs`.** Leia os manifestos (`package.json`, `pyproject.toml`,
  `go.mod`, `pom.xml`, `Gemfile`, `Cargo.toml`, `*.csproj`). Candidatas: framework e SDK principais,
  libs que mudam rápido ou cuja API o agente erra, as que aparecem em muitos arquivos. Aceitas viram
  linha em `.plumb/knowledge/stack/`.
- **(b) Acessos → `plumb-find-mcps`.** Cruze os sistemas que o projeto usa (CI, cards, **banco**,
  **filas**, **observabilidade**, **deploy** — os MCPs de **ciclo de vida**) com o que já está
  instalado. Sistema usado **sem** acesso do agente é lacuna. **Inclua o `knowledge-os` como
  OPCIONAL** — servidor/busca/UI por cima dos mesmos arquivos `.plumb/knowledge/`, para quem quiser;
  o Plumb funciona igual sem ele.
- **(c) Competências → `plumb-find-skills`.** Veja o que o usuário já tem (`~/.claude/skills`,
  `.claude/skills`, plugins) e o que ele já sabe/prefere (`~/.claude/CLAUDE.md`, global). Competência
  que o trabalho do projeto pede (teste de UI, migração de banco, revisão de segurança, acessibilidade)
  e que falta é lacuna. Processo da empresa que a entrevista revelou também entra aqui.

Priorize o que fecha lacuna de **verificação** (navegador, banco, CI, E2E) > entender (docs, cards) >
revisar (segurança) > conveniência. CLI antes de MCP. A recusa fica registrada com a data, para não
repetir. MCP só com leitura/chaves de teste/escopo; skill passa pela revisão de segurança do
`plumb-find-skills`.

## O bloco do AGENTS.md

Insira ou substitua **apenas** o bloco entre `<!-- plumb:start -->` e `<!-- plumb:end -->`, com **só
comandos e Workflow** — o resto do arquivo fica intacto. O conhecimento mora no `.plumb/knowledge/`,
**não** no `AGENTS.md`.

```
<!-- plumb:start -->
## Comandos
- Testes: <comando exato da suíte>
- Um teste: <como rodar um único teste>
- Lint: <comando> · Typecheck: <comando> · Build: <comando>
- Subir local: <comando>

## Ferramentas
- <ferramenta>: <quando usar> (ex.: `gh run view --log-failed` — CI falhou na branch)

Convenções do Plumb: <o combinado — ex.: conventional commits; commit por fase: sim>
Worktree: <como preparar um worktree novo — ex.: `npm ci` + copiar `.env.example`; ou "sem preparo">

## Workflow
Todo pedido passa pelo Plumb, roteado por situação. Pergunta responde direto depois de ler o
`.plumb/knowledge/` (projeto + global); correção pequena vai pela trilha direta; mudança padrão ou
profunda começa com o grill (perguntas de uma vez, recomendação primeiro, pela ferramenta de
perguntas), vira uma spec (objetivo, resultados esperados observáveis, fases com critério de saída)
aprovada antes de codar, e roda num worktree próprio. Escreva os testes primeiro; prove no nível
certo (nunca só unitário); peça confirmação antes de push, PR ou merge — nunca diga "pronto" sem
evidência executada. Falta doc atual de uma biblioteca: `plumb-find-docs`; falta acesso a um sistema:
`plumb-find-mcps`; falta uma competência: `plumb-find-skills` — a recomendação vai ao usuário e nada
se instala sem o "sim". O que durar (regra, decisão, procedimento) vai para o `.plumb/knowledge/`.
<!-- plumb:end -->
```

Depois, garanta o **`CLAUDE.md`** (Claude Code): crie-o com `@AGENTS.md`, ou acrescente a linha se já
existir sem ela. O parágrafo de Workflow é copiado **literalmente** — é o que ferramentas sem suporte
a skills seguem.

## Pegadinhas

- **Evidência em tudo que for mostrado como achado.** Sem evidência, é pergunta, não achado.
- **Produto que você não conhece:** pergunte a **categoria** ("gestor de tarefas?") e deixe o usuário
  nomear — não invente.
- **Não grave em lote no fim:** cada dimensão grava quando é confirmada.
- **Segredo:** token/`.env` com valor num arquivo não se cita nem se grava; proponha um registro vazio
  com o `fill_url` para o usuário preencher fora do chat.
- **Brownfield:** remova o arquivo antigo **só depois** de conferir que a nota entrou no
  `.plumb/knowledge/`. O `.git` dá o retorno; a remoção precisa do "sim".
- **Cérebro opcional:** se não der para criar a pasta, avise em uma linha e siga — proponha o
  conteúdo na mensagem. Nunca trave o init por causa do cérebro.
