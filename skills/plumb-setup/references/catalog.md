# Catálogo de ferramentas

Lido pelo `/plumb-setup` (e pelo orquestrador quando falta uma capacidade
no meio do trabalho). Cada ferramenta dá ao agente uma habilidade — e
cobra contexto, autenticação ou risco. Sugira só o que tem sinal no
repositório ou na fala do usuário.

## Regras de escolha

1. **Sinal antes de sugestão.** Toda sugestão cita a evidência: arquivo,
   dependência, remote, padrão de branch ou resposta do usuário. Sem sinal,
   não sugira.
2. **CLI antes de MCP.** Uma CLI não ocupa contexto até ser usada; um MCP
   lista as ferramentas dele em toda sessão. A própria documentação de
   custos do Claude Code recomenda `gh`, `aws`, `gcloud`, `sentry-cli`
   em vez dos MCPs equivalentes. MCP só quando não há CLI que faça o mesmo,
   ou quando o MCP dá algo que a CLI não dá (OAuth sem token, sessão de
   navegador persistente).
3. **No máximo 5 sugestões por rodada**, ordenadas pela lacuna que fecham no
   fluxo: verificar (navegador, banco) > entender (docs, tickets) > revisar
   (segurança) > conveniência. Vão ao usuário numa pergunta `multiSelect`, cada
   opção com o sinal citado e o custo; outra rodada só se ele pedir. O que ele
   recusa fica registrado em `context/stack` (modelo abaixo) e não se repete.
   Nada se instala sem o "sim".
4. **Escopo do projeto** (`claude mcp add --scope project …`, grava em
   `.mcp.json`) para o que o time inteiro usa; escopo `user` para
   preferências pessoais. Nunca commite token em `.mcp.json` — use
   variáveis de ambiente (`${VAR}`) ou OAuth.
5. **Somente leitura por padrão** em banco, nuvem e produção. Escrita só
   em ambiente local ou de teste, e só se o usuário pedir.
6. **Chaves de teste/sandbox** para pagamento, e-mail e afins — nunca de
   produção.
7. **Windows:** servidores locais via npx/uvx precisam de
   `claude mcp add <nome> -- cmd /c npx -y <pacote>`. Servidores remotos
   (HTTP) não têm esse problema.
8. **Depois de instalar:** `claude mcp list` para conferir a conexão e
   peça ao usuário para olhar o `/context` — alguns servidores HTTP
   carregam todas as definições de ferramenta de uma vez.
9. **Comandos mudam.** Os marcados *(confirmar)* não foram verificados na
   documentação do fornecedor; confira o link antes de rodar.
11. **No Cursor** não há `claude mcp add` nem `/plugin`: grave em
    `.cursor/mcp.json` (projeto) ou `~/.cursor/mcp.json` (pessoal).
    - Remoto `claude mcp add --transport http <nome> <url> --header "K: V"` →
      `"<nome>": { "url": "<url>", "headers": { "K": "V" } }`
    - Local `claude mcp add <nome> -- <cmd> <args…>` →
      `"<nome>": { "command": "<cmd>", "args": ["<args>", …] }`
    - Variáveis: `${env:NOME}` (em vez de `${NOME}`).
    - Entradas que só existem como plugin do Claude Code (plugins LSP,
      Semgrep, Sentry via marketplace, Figma via plugin) têm alternativa:
      use a URL/comando MCP da mesma linha; os plugins LSP não fazem falta,
      o Cursor já traz language servers.
    - O Cursor limita a quantidade de ferramentas MCP ativas (relatos de
      ~40): some as contagens antes de sugerir e prefira ainda mais as CLIs.
12. **Registre o que foi instalado** no bloco do `AGENTS.md`, grupo
    "Ferramentas", com uma linha de *quando usar* — é o que faz o agente
    lembrar de usá-la.

Legenda de custo: **0** = nenhum contexto fixo (CLI) · **B** = baixo
(≤ 5 ferramentas) · **M** = médio (6–30) · **A** = alto (> 30, prefira
toolsets reduzidos).

## Núcleo

Não conta no limite de 5: o Plumb depende dele.

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Knowledge OS (`knowledge-os`) | Segundo cérebro: regras, decisões, procedimentos, contexto e specs entre sessões, projetos e ferramentas | Sempre | `uv tool install --editable <pasta do Knowledge OS>` → `npx plumb-harness install` (registra o MCP e o hook de início de sessão). `npx plumb-harness status` confere | B (32 ferramentas) + o pacote de contexto no início. Local; com `remote_url` numa connection, também push/pull git. UI: `knowledge-mcp ui` |

## Economia de tokens e contexto

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| RTK | Saída de comandos (git, testes, docker, build) comprimida 60–90% antes de chegar ao modelo | Sempre útil; mais em repositórios com suítes verbosas | `winget install rtk-ai.rtk` · `brew install rtk` → `rtk init -g` → reiniciar o Claude Code. `rtk gain` mostra a economia | 0. Hook de PreToolUse. No Cursor, ver o suporte em `rtk init --help` *(confirmar)*. Pode esconder a linha decisiva numa falha — peça a saída bruta quando um teste falhar |
| Plugins LSP oficiais | Ir para definição, referências e diagnósticos depois de cada edição, sem ler arquivos inteiros | `tsconfig.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `*.csproj`, `Gemfile`, `composer.json`… | `/plugin install <lang>-lsp@claude-plugins-official` (typescript, pyright, gopls, rust-analyzer, jdtls, clangd, csharp, kotlin, lua, php, ruby, swift). O binário do language server precisa estar no PATH | B. Primeira escolha para navegação de código |
| Serena | Busca e edição por símbolo via language servers (40+ linguagens) | Repositório grande e multilíngue onde o LSP oficial não basta | `uv tool install -p 3.13 serena-agent` → `serena setup claude-code` | M. Sobrepõe-se aos plugins LSP — não instale os dois. A própria doc avisa que o Claude Code adere pouco às ferramentas dele sem ajustes |
| Context7 | Documentação atual e por versão de bibliotecas | Muitas dependências ou frameworks que mudam rápido (Next, React, LangChain…) | **Já vem no Plumb** como a skill `plumb-find-docs` (usa `npx ctx7@latest`, sem instalar nada). Login opcional para mais cota: `npx ctx7@latest login`. Só use o MCP (`claude mcp add --transport http context7 https://mcp.context7.com/mcp`) se o projeto preferir | 0 (skill) / B (MCP) |
| Statusline de contexto e custo | O usuário vê o % de contexto e o gasto em tempo real | Sempre útil | `/statusline mostre modelo, % de contexto usado e custo da sessão` · ou `npx -y ccusage statusline` | 0. `npx ccusage` gera relatórios por dia/sessão |
| caveman | Respostas telegráficas | Só se o usuário pedir respostas curtíssimas | `npx skills add JuliusBrussee/caveman -g` | Ganho medido modesto (~8–65% da saída) e ~1–1,5k tokens de entrada por turno. Conflita com o chat informativo do Plumb — nunca por padrão |

## Tickets e gestão

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| `gh` (CLI) | Issues, PRs, Actions, code scanning (`gh api`) | Remote `github.com`, `.github/` | `winget install GitHub.cli` · `brew install gh` → `gh auth login` | 0. **Preferir ao GitHub MCP** |
| GitHub MCP | O mesmo, via OAuth, sem CLI | Só se não puder instalar `gh` | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` (barra final obrigatória) | A (~50 ferramentas, ~30k tokens) — restrinja os toolsets |
| `glab` / GitLab MCP | Issues, MRs, pipelines | Remote GitLab, `.gitlab-ci.yml` | `glab` (CLI) · ou `claude mcp add --transport http gitlab https://gitlab.com/api/v4/mcp` (beta, Premium/Ultimate) | 0 / ? |
| Atlassian Rovo | Jira, Confluence, Bitbucket | Branches/commits com `ABC-123`, links `*.atlassian.net`, `bitbucket-pipelines.yml` | `claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp` → `/mcp` para OAuth | M–A. Consome créditos Rovo. Alternativa CLI: `acli` |
| Linear | Issues, projetos, comentários | Links `linear.app`, branches `ENG-123` | `claude mcp add --transport http linear-server https://mcp.linear.app/mcp` | M (~20) |
| Azure DevOps | Boards, repos, PRs, pipelines, wiki | Remote `dev.azure.com`, `azure-pipelines.yml` | `claude mcp add azure-devops -- npx -y @azure-devops/mcp <org>` | A — filtre por domínio. Alternativa: `az boards` / `az repos` |
| Notion | Ler e escrever páginas e bancos | Links `notion.so` em docs/PRs | `claude mcp add --transport http notion https://mcp.notion.com/mcp` | M. OAuth |
| ClickUp / Asana | Tarefas | Links nos docs; resposta do usuário | ClickUp: `claude mcp add --transport http clickup https://mcp.clickup.com/mcp` · Asana: `https://mcp.asana.com/v2/mcp` (exige app OAuth registrado) | ? |

## Documentação e conhecimento

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Context7 | (ver Economia) | | | |
| Microsoft Learn | Docs e exemplos oficiais de .NET/Azure | `*.csproj`, `*.sln`, `*.bicep`, `azure.yaml`, `@azure/*` | `claude mcp add --transport http microsoft-learn https://learn.microsoft.com/api/mcp` | B (3). Sem auth |
| AWS Knowledge | Docs AWS, disponibilidade por região | `cdk.json`, `template.yaml` (SAM), `boto3`, `@aws-sdk/*`, provider AWS no Terraform | `claude mcp add --transport http aws-knowledge https://knowledge-mcp.global.api.aws` | B. Sem auth |
| DeepWiki | Perguntas sobre repositórios públicos do GitHub (dependências open source) | Dependência OSS pouco documentada | `claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp` | B (3). Sem auth |
| Confluence | (ver Atlassian Rovo) | | | |
| Google Drive | Buscar e ler documentos | Links `docs.google.com` | Remoto `https://drivemcp.googleapis.com/mcp/v1` (preview; exige cliente OAuth próprio) | ? |
| Diagramas | Diagramas versionados no próprio markdown | Trilha profunda | **Mermaid** em bloco ```` ```mermaid ```` — nenhuma instalação; GitHub e GitLab renderizam | 0. Preferir a MCPs de desenho |

## Verificação de UI, navegador e mobile

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Playwright CLI | Dirigir o navegador e verificar fluxos; snapshots vão para disco | Front-end web: `playwright.config.*`, Vite, Next, React, Vue, Angular | `npm i -g @playwright/cli@latest` → `playwright-cli install --skills` | 0. A Microsoft recomenda a CLI para agentes (~27k vs ~114k tokens por tarefa em relação ao MCP) |
| Playwright MCP | Sessão de navegador persistente; rede, storage, PDF com `--caps` | Mesmo sinal, quando a sessão contínua importar | `claude mcp add playwright -- npx @playwright/mcp@latest` | M (~24; 70+ com todas as caps) |
| Chrome DevTools MCP | Traces de performance, rede, console | Performance web importa; bug só no navegador | `claude mcp add chrome-devtools --scope user -- npx chrome-devtools-mcp@latest --no-usage-statistics` | M (~29). Só Chrome; coleta estatísticas por padrão (a flag desliga) |
| axe-core | Auditoria de acessibilidade | `axe-core`, `@axe-core/playwright`, requisitos de a11y | `npx @axe-core/cli <url>` | 0. O MCP da Deque exige assinatura paga |
| Maestro | Rodar fluxos em app mobile | `.maestro/`, React Native, Flutter, Expo | `claude mcp add maestro -- maestro mcp` | A (47+). iOS exige macOS |
| mobile-mcp | Tocar, deslizar, capturar tela em emulador/dispositivo | `android/`, `ios/`, `*.xcodeproj` | `claude mcp add mobile-mcp -- npx -y @mobilenext/mobile-mcp@latest` | M–A. No Windows, só Android |

## Design

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Figma (remoto) | Contexto do design, variáveis, Code Connect | Links `figma.com`, `@figma/code-connect`, `figma.config.json` | `claude plugin install figma@claude-plugins-official` · ou `claude mcp add --transport http figma https://mcp.figma.com/mcp` | ? OAuth |
| Storybook | Docs de componentes, preview e testes de stories | `.storybook/`, Storybook ≥ 9.1.16 | `npx storybook add @storybook/addon-mcp` → `claude mcp add storybook-mcp --transport http http://localhost:6006/mcp --scope project` | B (7). Exige o dev server rodando |

## API

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Hurl | Testes HTTP em texto puro, com asserções — ótimo para os negativos de integração | `*.hurl`, ou qualquer API HTTP sem teste de integração | `winget install hurl` · `brew install hurl` | 0 |
| Spec OpenAPI | Contrato da API | `openapi.{yaml,json}`, `swagger.json` | Nenhuma: o agente lê o arquivo. Se for grande: `claude mcp add openapi -- npx -y apidog-mcp-server@latest --oas=./openapi.yaml` | 0 / B |
| Postman | Coleções, ambientes, mocks | `*.postman_collection.json`, `postman/` | `claude mcp add --transport http postman https://mcp.postman.com/minimal --header "Authorization: Bearer ${POSTMAN_API_KEY}"` | A (~37 no minimal) |

## Dados (somente leitura)

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| CLI do banco | Conferir o estado depois de um teste de integração | `docker-compose` com postgres/mysql/mongo; migrations | `psql`, `mysql`, `mongosh`, `redis-cli`, `sqlite3` com usuário **somente leitura** do ambiente local | 0. Preferir ao MCP |
| DBHub (Bytebase) | SQL somente leitura em Postgres, MySQL, SQL Server, SQLite, MariaDB | Vários bancos no mesmo projeto | `claude mcp add dbhub -- npx -y @bytebase/dbhub --dsn "${DATABASE_URL}" --readonly` *(confirmar)* | B |
| Postgres MCP Pro | Saúde do banco, planos de execução, índices | Postgres com problema de performance | `claude mcp add postgres -- uvx postgres-mcp --access-mode=restricted` *(confirmar)* | B–M |
| MongoDB MCP | Consultas e schema do Mongo | `mongoose`, `mongodb` nas dependências | `claude mcp add mongodb -- npx -y mongodb-mcp-server --readOnly` *(confirmar)* | M |
| Supabase / Neon | Schema, consultas, branches do banco gerenciado | `supabase/`, `@supabase/*`; `@neondatabase/*` | Supabase: `https://mcp.supabase.com/mcp?read_only=true` · Neon: `https://mcp.neon.tech/mcp` *(confirmar)* | M. Use o modo somente leitura |
| Prisma | Migrations e schema | `prisma/schema.prisma` | `npx prisma mcp` *(confirmar)* — a CLI `prisma` já cobre quase tudo | B |

## Nuvem, infraestrutura e deploy

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| CLIs de nuvem | Ler recursos, logs, status de deploy | `cdk.json`/`template.yaml` (AWS), `azure.yaml`/`*.bicep`, `app.yaml`/`cloudbuild.yaml` (GCP) | `aws`, `az`, `gcloud` com perfil **somente leitura** | 0. Preferir aos MCPs |
| Terraform | Docs de providers e módulos, plano | `*.tf` | `terraform plan` (CLI) · MCP da HashiCorp: `docker run -i --rm hashicorp/terraform-mcp-server` *(confirmar)* | 0 / M. Nunca `apply` pelo agente |
| Kubernetes | Estado do cluster | `k8s/`, `helm/`, `kustomization.yaml` | `kubectl` com contexto local/dev, somente leitura | 0 |
| Docker | Subir dependências locais, logs | `Dockerfile`, `docker-compose.yml` | `docker` / `docker compose` (CLI) | 0 |
| Vercel / Netlify / Cloudflare / Railway | Deploys, logs, variáveis | `vercel.json`; `netlify.toml`; `wrangler.toml`; `railway.json` | CLIs `vercel`, `netlify`, `wrangler`, `railway` · MCPs oficiais existem (Vercel `https://mcp.vercel.com`, Cloudflare `https://docs.mcp.cloudflare.com/mcp`) *(confirmar)* | 0 / M |

## Observabilidade e erros

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Sentry | Stack traces e eventos reais para reproduzir bugs | `@sentry/*`, `sentry-sdk`, `sentry.properties` | `claude plugin marketplace add getsentry/sentry-mcp` → `claude plugin install sentry-mcp@sentry-mcp` (traz subagente que isola a saída) · ou `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` · CLI: `sentry-cli` | M. OAuth |
| Grafana / Datadog / PostHog | Métricas, logs, eventos de produto | `grafana/`, `dd-trace`/`datadog`, `posthog-js` | MCPs oficiais existem *(confirmar)*: `mcp-grafana`, servidor remoto do Datadog, `https://mcp.posthog.com/mcp` | M. Só leitura |

## CI/CD

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| CLIs de CI | Status e logs da pipeline da branch | `.github/workflows/` → `gh run list/view --log-failed` · `.gitlab-ci.yml` → `glab ci` | Já vêm com `gh` / `glab` | 0 |
| CircleCI | Logs de build com falha, testes instáveis | `.circleci/config.yml` | `claude mcp add circleci -- npx -y @circleci/mcp-server-circleci` *(confirmar)* | M. Token |

## Segurança e qualidade

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Semgrep | SAST, dependências, segredos; varredura depois de cada edição | `.semgrep.yml`, Semgrep na CI, áreas de auth/pagamento | Plugin via `/plugin` (buscar Semgrep) → `/setup-semgrep-plugin` · CLI: `semgrep scan --json` | B. Token opcional |
| Trivy | Vulnerabilidades em filesystem, imagens, IaC | `Dockerfile`, `*.tf`, YAML de k8s | `trivy fs .` (CLI) · MCP: `trivy plugin install mcp` → `claude mcp add trivy -- trivy mcp` | 0 / B. A CLI basta |
| Snyk | SCA, SAST, IaC, containers | `.snyk` | `npx -y snyk@latest mcp configure --tool=claude-cli` · CLI: `snyk test` | M. Também grava regras globais no seu Claude |
| GitGuardian | Segredos vazados | `.gitguardian.yaml`, hook `ggshield` | `ggshield secret scan repo .` (CLI) · ou `claude mcp add --transport http gitguardian https://mcp.gitguardian.com/mcp` | 0 / ? |
| SonarQube | Issues, quality gates, hotspots | `sonar-project.properties`, badge SonarCloud | `claude mcp add sonarqube --env SONARQUBE_TOKEN=${SONARQUBE_TOKEN} --env SONARQUBE_ORG=<org> -- docker run -i --rm --init -e SONARQUBE_TOKEN -e SONARQUBE_ORG mcp/sonarqube` | M. Exige Docker |
| Auditoria do ecossistema | Dependências vulneráveis | Qualquer manifesto | `npm audit`, `pnpm audit`, `pip-audit`, `govulncheck`, `cargo audit`, `bundle audit` | 0 |

## Segredos e serviços externos de teste

| Ferramenta | Dá ao agente | Sinal | Instalação | Custo / obs. |
|---|---|---|---|---|
| Segredos do cérebro | Rodar comandos com credenciais sem o valor entrar no contexto | `.env.example`, tokens pedidos na conversa | Já vem: item `secret` + `knowledge-mcp run --env VAR=secret/<nome> -- <cmd>` (molde) | 0. Preferido |
| Injeção de segredos por CLI de terceiros | O mesmo, com o cofre que o time já usa | referências a `op://`, `doppler.yaml`, `.infisical.json` | `op run -- <cmd>` (1Password) · `doppler run -- <cmd>` · `infisical run -- <cmd>` | 0. O agente nunca lê nem imprime o valor |
| Stripe | Objetos e logs no modo de teste | `stripe` nas dependências | CLI `stripe` com chave de teste · MCP remoto `https://mcp.stripe.com` *(confirmar)* | M. Só chaves `sk_test_` |
| Mocks de serviços externos | Simular a falha mais cara de uma integração | Chamadas HTTP a terceiros sem stub nos testes | WireMock (`docker run -p 8080:8080 wiremock/wiremock`) · Testcontainers (biblioteca) | 0 |
| Carga | Medir latência e throughput | Requisito de performance no card | `k6 run script.js` | 0 |

## Sinais de onde o time trabalha (confirme, não deduza)

Cada sinal abaixo é um **achado para mostrar com a evidência e o usuário confirmar**,
nunca uma decisão silenciosa:

1. Cards e documentação: remote GitHub e nenhum outro sinal → GitHub Issues;
   ids `ABC-123` com link `atlassian.net` em commits ou README → Jira/Confluence;
   `linear.app` → Linear. Mostre o sinal e pergunte, com essa hipótese em primeiro.
2. Ferramentas do dia a dia (erros, design, banco, deploy): só as que aparecem nas
   dependências, na CI ou nas configs do repositório.

## Varredura de recomendações (dimensão 8)

Três varreduras, cada uma ligada a uma skill de busca. Os sinais e a priorização
estão em `dimensions.md`, dimensão 8; aqui, o que consultar:

| Varredura | Olha | Recomenda por |
|---|---|---|
| Documentação atual | manifestos (`package.json`, `pyproject.toml`, `go.mod`, `pom.xml`, `Gemfile`, `composer.json`, `Cargo.toml`, `*.csproj`) | `plumb-find-docs` (Context7 via `npx ctx7@latest`; sem contexto fixo) |
| Acessos | `claude mcp list`, `.mcp.json`, `.cursor/mcp.json`, `~/.cursor/mcp.json` x sistemas do projeto (CI, tarefas, banco, erros, design, deploy) | `plumb-find-mcps`, com as linhas deste catálogo |
| Competências | `~/.claude/skills`, `.claude/skills`, plugins e skills disponíveis na ferramenta; `~/.claude/CLAUDE.md`, itens globais e de preferência do cérebro | `plumb-find-skills` (cópia revisada, nunca instalação direta) |

## Modelo de `context/stack`

Uma linha por sistema; o que o agente alcança e o que foi combinado. É o que impede
repetir a mesma recomendação.

```
Linear — conectado (MCP linear, escopo projeto) · quando: ler o card antes de planejar
Sentry — sem MCP · candidato: sentry-cli (sinal: @sentry/node em package.json:22)
Figma — não usam
Semgrep — recusado — 2026-10-10 (motivo: o CI já roda)
Documentação (plumb-find-docs): next ^15.1, prisma ^6.2, zod ^3.23
```

Estados: *conectado*, *sem MCP* (candidato), *não usam*, *recusado* (com a data e o
motivo). Não guarde id de tarefa nem segredo.
