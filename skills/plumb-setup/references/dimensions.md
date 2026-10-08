# As dimensões do setup

O setup percorre estas dez dimensões, **uma por mensagem**, na ordem. Cada uma tem
o que inferir (e de onde), o que **perguntar**, e os itens que nascem. Moldes de
tipo, key, scope e origin: `../../plumb/references/brain.md`.

**Regra de ouro:** infira só o que tem **evidência direta no repositório** e mostre
a evidência (arquivo, comando, linha do `git log`). Tudo que for interpretação —
o porquê, a intenção, a preferência, a regra de negócio, o que é "importante" — é
**pergunta**, nunca inferência. Contagem de itens não é meta: cada item passa pelo
teste do tipo, e o que um agente descobre sozinho em segundos lendo o código não
entra.

**`origin` de cada item:**
- `user` — o usuário respondeu ou corrigiu.
- `code` — inferido do repositório, com a evidência no `content` ou no `source`, e
  confirmado por ele.
- `agent` — o resto (nunca grave sem confirmação).

Dimensão que não se aplica (sem interface, sem banco, projeto solo): diga uma
linha — `Design: não se aplica, não há interface` — para o usuário poder corrigir.
Nunca pule em silêncio.

## 1. Produto e domínio

| | |
|---|---|
| **Infere de** | README, `docs/`, descrição do manifesto, nomes de pastas e de entidades, rotas |
| **Pergunta** | Para quem é e que problema resolve (em uma frase)? Quais termos do domínio têm significado próprio? Que regras de negócio um dev novo erraria? O que **não** é escopo deste projeto? |
| **Nasce** | `context/produto` (o que é, quem usa, o que não é) · `context/glossario` (termos) · `rule/business` por regra de negócio ditada (com `scope_paths` se vale numa área; `origin=user`) · `links` para docs e cards de produto |

## 2. Stack e ambiente

| | |
|---|---|
| **Infere de** | manifestos e lockfiles, `docker-compose`, CI, `.env.example` (só os **nomes** das variáveis), versões em `.nvmrc`/`.tool-versions`, remote do git |
| **Pergunta** | Roda onde (local, container, nuvem)? Há serviço que o código não mostra (banco gerenciado, fila, terceiro)? Qual versão de runtime o time usa de fato? |
| **Nasce** | `context/stack` — o que o projeto usa **e o que o agente alcança**, uma linha por sistema: *conectado*, *sem MCP* (existe e o agente não alcança: candidato) ou *não usam* (nunca pergunte de novo). Segue o modelo em `catalog.md` · `context/environment` (subtipo `environment`) — como subir o ambiente, portas, serviços, `links` |

## 3. Mapa do código

| | |
|---|---|
| **Infere de** | pastas de primeiro nível e de testes, pontos de entrada, módulos mais importados |
| **Pergunta** | Qual parte é legado ou vendorizada (não tocar)? Qual é o "coração"? Há nome de pasta que engana? |
| **Nasce** | `context/mapa` (até 8 linhas: onde vive cada coisa) · `rule/pattern` por molde de composição que **3 ou mais arquivos** seguem igual (convenção é o que o código faz, não o que a doc diz), com `Arquivo-modelo:` · candidatos a `subject` só para áreas com nome próprio que já terão 3+ itens |

## 4. Comandos

| | |
|---|---|
| **Infere de** | scripts do manifesto, `Makefile`, CI (a fonte mais confiável) |
| **Pergunta** | Qual o comando que o time realmente roda antes de abrir PR? Algum comando que parece existir mas está quebrado? Posso rodar a suíte uma vez para confirmar? |
| **Nasce** | **Não vai para o cérebro:** vai para o bloco do `AGENTS.md` (até 20 linhas): suíte, um único teste, lint, typecheck, build, subir local — com o comando exato |

## 5. Convenções

| | |
|---|---|
| **Infere de** | `git log --oneline -30` (formato de commit, id de ticket), nomes de branch recentes, linter e formatter configurados, `CONTRIBUTING`, o código vizinho |
| **Pergunta** | A convenção de commit/branch que apareceu é a que vale ou é acidente? Erro e log seguem algum formato? Nome de arquivo, de teste, de variável? Algo que a revisão sempre cobra? |
| **Nasce** | `rule/code` (nomes, estrutura, tratamento de erro, testes) · `rule/process` (commit, branch, PR) — cada um com `scope_paths` quando vale só numa área, o porquê no `summary` e `origin` certo |

## 6. Áreas sensíveis

| | |
|---|---|
| **Infere de** | SDKs de pagamento e auth nas dependências, pastas `auth`, `payments`, `billing`, migrations, modelos com dados pessoais, uso de `tenant_id` |
| **Pergunta** | Cobra dinheiro, e por onde? Como autentica e autoriza? Que dado pessoal circula? Há isolamento entre clientes? O que mais, se quebrar, perde dado ou dinheiro? |
| **Nasce** | `rule/security` com `scope_paths` estreito — é o que liga a revisão de segurança. Marque só o que é de fato auth, autorização, pagamento, dado pessoal, tenant ou segredo |

## 7. Procedimentos

| | |
|---|---|
| **Infere de** | `scripts/`, pasta `migrations/` com script, geradores, release no CI, `docs/` operacionais |
| **Pergunta** | Que processo vive só na cabeça de alguém (release, deploy, rotação de chave, como reproduzir um bug em produção)? Quais passos, em que ordem, com que comando? |
| **Nasce** | `howto/*` com os comandos exatos e `scope_paths` quando é de uma área. Teste: um agente novo executaria só com o `content`? Passo a passo com scripts de apoio de verdade continua como skill, e o `howto` aponta para ela |

## 8. Ferramentas e acessos

| | |
|---|---|
| **Infere de** | `claude mcp list` / `.cursor/mcp.json`, dependências (SDK de observabilidade, ORM), remotes, IaC, workflows |
| **Pergunta** | Onde ficam os cards? Como vocês veem o erro que o usuário teve? Onde isso roda? Posso olhar dado real (somente leitura)? Há teste ponta a ponta? Que tokens o trabalho precisa? |
| **Nasce** | Atualiza `context/stack` (conectado / sem MCP / não usam) · propostas de ferramenta (`catalog.md`, no máximo 5, **CLI antes de MCP**, nada sem o "sim"; falta de acesso: `plumb-find-mcps`) · `secret/*` vazio para cada token necessário, com o `fill_url` colado para o usuário preencher |

## 9. Time e fluxo

| | |
|---|---|
| **Infere de** | `CODEOWNERS`, templates de PR, ids de ticket nos commits, CI |
| **Pergunta** | Quem revisa e aprova? O que é "pronto" aqui? Precisa avisar alguém ao entregar (e onde)? Há janela ou regra de release? Projeto solo ou com time? |
| **Nasce** | `rule/process` (definição de pronto, revisão, comunicação) com `origin=user` · `links` para o gestor de tarefas e docs de processo |

## 10. Preferências do usuário

| | |
|---|---|
| **Infere de** | o que já existe como `scope=global` (`item_search(scope=["global"])`), o `~/.claude/CLAUDE.md`, o idioma da conversa |
| **Pergunta** | Só o que **falta** depois de ler o que já existe: idioma das respostas, tom e nível de detalhe, como quer ser avisado, o que nunca fazer sem perguntar, ferramentas pessoais, particularidades da máquina |
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
tags=...)` ou pelo tipo), confronta com o código e pergunta só a diferença:
`context/mapa` diz X, o código tem Y — qual vale?; este `howto` cita um comando que
não existe mais. Propostas: atualizar pela mesma key, `outdated`/`archived` com a
evidência, juntar duplicatas (`supersedes`). Pergunte o que mudou desde o último
setup (time, ferramentas, regras novas).
