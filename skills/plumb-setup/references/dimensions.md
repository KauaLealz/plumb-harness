# As dimensões do setup

O setup percorre estas dez dimensões, **uma por vez**, na ordem, no modelo grill: o
que o repositório responde é **mostrado com a evidência e confirmado**; o que ele não
responde é **perguntado, uma pergunta por vez, com a recomendação em primeiro**, sempre
pela ferramenta de perguntas (`../SKILL.md`, "Como perguntar"). Cada dimensão tem o que
explorar (e de onde), o que **perguntar**, e os itens que nascem. Moldes de tipo, key,
scope, origin e tags: `../../plumb/references/brain.md` (a seção Tags: reaproveite
`tag_list`, 1 a 3 tags de área por item).

**Regra de ouro:** só é achado o que tem **evidência direta no repositório**, e todo
achado é mostrado com a evidência (arquivo, comando, linha do `git log`) e
confirmado antes de gravar. Tudo que for interpretação — o porquê, a intenção, a
preferência, a regra de negócio, o que é "importante" — é **pergunta**, nunca
dedução. Contagem de itens não é meta: cada item passa pelo
teste do tipo, e o que um agente descobre sozinho em segundos lendo o código não
entra.

**`origin` de cada item:**
- `user` — o usuário respondeu ou corrigiu.
- `code` — inferido do repositório, com a evidência no `content` ou no `source`, e
  confirmado por ele.
- `agent` — o resto (nunca grave sem confirmação, nem em silêncio).

Dimensão que não se aplica (sem interface, sem banco, projeto solo): diga uma
linha com a evidência (`Design: não há interface, só API`) e pergunte, pela
ferramenta, se é isso mesmo (recomendação: pular). Nunca pule em silêncio.

## 1. Produto e domínio

| | |
|---|---|
| **Explora** | README, `docs/`, descrição do manifesto, nomes de pastas e de entidades, rotas |
| **Pergunta** | Para quem é e que problema resolve (em uma frase)? Quais termos do domínio têm significado próprio? Que regras de negócio um dev novo erraria? O que **não** é escopo deste projeto? |
| **Nasce** | `context/produto` (o que é, quem usa, o que não é) · `context/glossario` (termos) · `rule/business` por regra de negócio ditada (com `scope_paths` se vale numa área; `origin=user`) · `links` para docs e cards de produto |

## 2. Stack e ambiente

| | |
|---|---|
| **Explora** | manifestos e lockfiles, `docker-compose`, CI, `.env.example` (só os **nomes** das variáveis), versões em `.nvmrc`/`.tool-versions`, remote do git |
| **Pergunta** | Roda onde (local, container, nuvem)? Há serviço que o código não mostra (banco gerenciado, fila, terceiro)? Qual versão de runtime o time usa de fato? |
| **Nasce** | `context/stack` — o que o projeto usa **e o que o agente alcança**, uma linha por sistema: *conectado*, *sem MCP* (existe e o agente não alcança: candidato), *não usam* ou *recusado* (nunca pergunte de novo). Segue o modelo em `catalog.md` · `context/environment` (subtipo `environment`) — como subir o ambiente, portas, serviços, `links` |

## 3. Mapa do código

| | |
|---|---|
| **Explora** | pastas de primeiro nível e de testes, pontos de entrada, módulos mais importados |
| **Pergunta** | Qual parte é legado ou vendorizada (não tocar)? Qual é o "coração"? Há nome de pasta que engana? |
| **Nasce** | `context/mapa` (até 8 linhas: onde vive cada coisa) · `rule/pattern` por molde de composição que **3 ou mais arquivos** seguem igual (convenção é o que o código faz, não o que a doc diz), com `Arquivo-modelo:` · candidatos a `subject` só para áreas com nome próprio que já terão 3+ itens |

## 4. Comandos

| | |
|---|---|
| **Explora** | scripts do manifesto, `Makefile`, CI (a fonte mais confiável) |
| **Pergunta** | Qual o comando que o time realmente roda antes de abrir PR? Algum comando que parece existir mas está quebrado? Rodo a suíte uma vez para confirmar? (recomendação: sim, só leitura) |
| **Nasce** | **Não vai para o cérebro:** vai para o bloco do `AGENTS.md` (até 20 linhas): suíte, um único teste, lint, typecheck, build, subir local — com o comando exato |

## 5. Convenções

| | |
|---|---|
| **Explora** | `git log --oneline -30` (formato de commit, id de ticket), nomes de branch recentes, linter e formatter configurados, `CONTRIBUTING`, o código vizinho |
| **Pergunta** | A convenção de commit/branch que apareceu é a que vale ou é acidente? Erro e log seguem algum formato? Nome de arquivo, de teste, de variável? Algo que a revisão sempre cobra? |
| **Nasce** | `rule/code` (nomes, estrutura, tratamento de erro, testes) · `rule/process` (commit, branch, PR) — cada um com `scope_paths` quando vale só numa área, o porquê no `summary` e `origin` certo |

## 6. Áreas sensíveis

| | |
|---|---|
| **Explora** | SDKs de pagamento e auth nas dependências, pastas `auth`, `payments`, `billing`, migrations, modelos com dados pessoais, uso de `tenant_id` |
| **Pergunta** | Cobra dinheiro, e por onde? Como autentica e autoriza? Que dado pessoal circula? Há isolamento entre clientes? O que mais, se quebrar, perde dado ou dinheiro? |
| **Nasce** | `rule/security` com `scope_paths` estreito — é o que liga a revisão de segurança. Marque só o que é de fato auth, autorização, pagamento, dado pessoal, tenant ou segredo |

## 7. Procedimentos

| | |
|---|---|
| **Explora** | `scripts/`, pasta `migrations/` com script, geradores, release no CI, `docs/` operacionais |
| **Pergunta** | Que processo vive só na cabeça de alguém (release, deploy, rotação de chave, como reproduzir um bug em produção)? Quais passos, em que ordem, com que comando? |
| **Nasce** | `howto/*` com os comandos exatos e `scope_paths` quando é de uma área. Teste: um agente novo executaria só com o `content`? Passo a passo com scripts de apoio de verdade continua como skill, e o `howto` aponta para ela |

## 8. Ferramentas, acessos e worktree

| | |
|---|---|
| **Explora** | `claude mcp list` / `.mcp.json` / `.cursor/mcp.json`, dependências (SDK de observabilidade, ORM), remotes, IaC, workflows, e a varredura de recomendações abaixo |
| **Pergunta** | Onde ficam os cards? Como vocês veem o erro que o usuário teve? Onde isso roda? Pode-se olhar dado real (somente leitura)? Há teste ponta a ponta? Que tokens o trabalho precisa? Como preparar um worktree novo (abaixo)? |
| **Nasce** | Atualiza `context/stack` (conectado / sem MCP / não usam / recusado, mais as bibliotecas para consulta de documentação) · recomendações aceitas, instaladas no fechamento · `secret/*` vazio para cada token necessário, com o `fill_url` colado para o usuário preencher · a linha `Worktree:` do `AGENTS.md` |

### Varredura de recomendações

Faça as três varreduras **antes** de perguntar. Cada uma produz candidatos com o
**sinal citado**; o que já está instalado ou foi recusado antes (`context/stack`)
fica de fora.

**(a) Documentação atual → `plumb-find-docs`.**
- Leia os manifestos: `package.json` (dependencies, não só devDependencies),
  `pyproject.toml`/`requirements*.txt`, `go.mod`, `pom.xml`/`build.gradle*`,
  `Gemfile`, `composer.json`, `Cargo.toml`, `*.csproj`.
- Candidatas à consulta: framework e SDK principais, bibliotecas que mudam rápido
  ou cuja API o agente costuma errar (frameworks web, ORMs, SDKs de IA e de nuvem,
  bibliotecas de UI), e as que aparecem em muitos arquivos do `src`. Fora:
  utilitários pequenos e estáveis.
- Sinal citado: a dependência com a versão e o arquivo (`next ^15.1 em package.json:18`).
  Custo: nenhum contexto fixo (`npx ctx7@latest` roda só quando consultado).
- Aceitas vão para `context/stack` na lista `Documentação (plumb-find-docs):`.

**(b) Acessos → `plumb-find-mcps`.**
- Instalados: `claude mcp list`, `.mcp.json`, `.cursor/mcp.json`, `~/.cursor/mcp.json`.
- Sistemas que o projeto usa, pelos sinais: CI (`.github/workflows/`), gestor de
  tarefas (ids nos commits, links), banco (`docker-compose`, migrations, ORM),
  observabilidade (`@sentry/*`, `dd-trace`), design (links `figma.com`), deploy
  (`vercel.json`, `railway.json`, IaC).
- Lacuna = sistema usado **sem** acesso do agente. Recomende pelo catálogo, CLI
  antes de MCP, com o sinal e o custo.

**(c) Competências → `plumb-find-skills`.**
- O que o usuário já tem: `~/.claude/skills`, `.claude/skills` e, se a ferramenta
  oferecer, as de listar e sugerir skills e plugins (para ver o que está instalado
  e o que o catálogo dele sugere).
- O que ele já sabe e prefere: `~/.claude/CLAUDE.md`, os itens `scope=global` e o
  project `preferencias` do cérebro, os itens anteriores do projeto.
- Lacuna = competência que o trabalho deste projeto pede (teste de interface,
  migração de banco, revisão de segurança, acessibilidade, a stack específica) e
  que ele não tem nem em skill nem em plugin. Sinal citado: o arquivo ou a
  dependência que a pede e a ausência no que ele já tem.

**Priorize** o que fecha lacuna de **verificação** (navegador, banco, CI, teste de
ponta a ponta), depois entender, revisar e conveniência. **Até 5 por rodada** numa
pergunta `multiSelect`; outra rodada só se o usuário pedir. A recusa fica registrada
em `context/stack` como `recusado: <nome> — <data>`: não se repete. Nada se instala
sem o "sim" (e, para skill, a revisão de segurança de `plumb-find-skills`).

### Worktree

Pergunte, uma por vez e com a recomendação em primeiro: (1) instalar dependências
num worktree novo? com que comando (o do manifesto ou da CI); (2) copiar o `.env`
(ou gerar do `.env.example`)? (3) alguma porta, banco ou serviço que precise mudar
para não colidir com a árvore principal? Junte a resposta na linha
`Worktree: <como preparar>` do bloco do `AGENTS.md` (`Worktree: sem preparo` se
nada for preciso).

## 9. Time e fluxo

| | |
|---|---|
| **Explora** | `CODEOWNERS`, templates de PR, ids de ticket nos commits, CI |
| **Pergunta** | Quem revisa e aprova? O que é "pronto" aqui? Precisa avisar alguém ao entregar (e onde)? Há janela ou regra de release? Projeto solo ou com time? |
| **Nasce** | `rule/process` (definição de pronto, revisão, comunicação) com `origin=user` · `links` para o gestor de tarefas e docs de processo |

## 10. Preferências do usuário

| | |
|---|---|
| **Explora** | o que já existe como `scope=global` (`item_search(scope=["global"])`), o `~/.claude/CLAUDE.md`, o idioma da conversa |
| **Pergunta** | Só o que **falta** depois de ler o que já existe (cada uma pela ferramenta, uma por vez): idioma das respostas, tom e nível de detalhe, como quer ser avisado, o que nunca fazer sem perguntar, ferramentas pessoais, particularidades da máquina |
| **Nasce** | `rule/process` e `context/environment` no project `preferencias` do workspace pessoal global, com `scope=global`. **Tudo aqui pede o "sim"** (vale em todo projeto dele). Não duplique o que já está lá |

## Projeto novo (fundação)

Sem código para ler, as dimensões 3, 5 e 7 viram **propostas**, não inferência: a
partir do que o usuário disse que o projeto vai ser, proponha a decisão com o
porquê e a alternativa descartada, e ele revisa. Temas: linguagem, runtime e
framework; estrutura de pastas (por camada ou por feature); testes (runner e
níveis); padrão de API, erros e logs; persistência; CI, deploy e convenções de
branch e commit. Cada decisão vira `rule/decision` com `## Por quê` e
`## Alternativa descartada`. Grave também `context/projeto-novo`
("Projeto novo desde AAAA-MM-DD"): é ele que faz o orquestrador sugerir uma
auditoria quando o código amadurecer. Nada de `rule/pattern` nem `howto` ainda:
nascem dos padrões que as primeiras mudanças estabelecerem. Não crie o esqueleto
aqui: ele é a primeira mudança, pelo fluxo normal.

## Projeto já ligado (auditoria)

Cada dimensão começa pelo que o cérebro **já tem** (`item_search(repo=".",
tags=...)` ou pelo tipo), confronta com o código e pergunta só a diferença (uma pergunta por vez, pela ferramenta):
`context/mapa` diz X, o código tem Y — qual vale?; este `howto` cita um comando que
não existe mais. Propostas: atualizar pela mesma key, `outdated`/`archived` com a
evidência, juntar duplicatas (`supersedes`). Pergunte o que mudou desde o último
setup (time, ferramentas, regras novas).
