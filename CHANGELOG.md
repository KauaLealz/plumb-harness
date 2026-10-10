# Changelog

## 6.0.0

O Plumb deixa de decidir por conta própria: **entrevista** o usuário no modelo
grill-me, trabalha cada mudança num **worktree** próprio, deixa a coordenação entre
agentes no **próprio item de spec** e passa a **recomendar ferramentas** (docs, MCPs,
skills) no momento certo.

### Quebras de compatibilidade

| Antes | Agora |
|---|---|
| "Decidir, não perguntar": o agente inferia e a spec listava "Decidi:" com a fonte | grill obrigatório em padrão e profunda (na direta, só se o pedido for ambíguo); a spec traz "Combinado", o que o usuário decidiu |
| perguntas em texto no fim da mensagem | toda pergunta pela ferramenta de perguntas do Claude, recomendação em primeiro; sem a ferramenta (Cursor), lista numerada |
| mudança na árvore principal | padrão e profunda em `.claude/worktrees/<id>`, branch própria; a entrega pergunta push, PR ou merge local |
| bloco Plumb do `AGENTS.md` com até 20 linhas | até 24 (entra a linha `Worktree:`) |
| recomendar ferramenta só com duas evidências e só diante de uma "falta" | uma evidência citada basta no dream; checagem de ferramentas na fase Entender |

### Adicionado

- **`/plumb-grill <tema>`** (`skills/plumb-grill`): entrevista uma pergunta por vez, com a
  recomendação primeiro, explorando código, cérebro e card antes de perguntar; termina
  num resumo do entendimento e só vira spec com o "sim". Também roda sozinho, sem spec.
- **Worktree por mudança** (`references/worktrees.md`): criar, preparar, trazer a base,
  entregar, limpar, retomar e achar órfãos. `.claude/worktrees/` vai para
  `.git/info/exclude`.
- **Coordenação na spec**, sem tool nem campo novo no servidor: `summary` no formato
  `<estado> · <fase n/total> · <branch> · <worktree> · <agente>`, cabeçalho padronizado,
  tags de estado (`aguardando-aprovacao`, `em-andamento`, `parada`) e de área, reaproveitando
  `tag_list`. "O que está em andamento?" lista as specs e aponta órfãos; pedido em área
  com spec ativa de outro agente pergunta se sequencia ou paraleliza.
- **Link `url`** da spec colado ao usuário ao criar, atualizar e entregar (exige o servidor
  que devolve `url` em `item_save`, `item_get` e `item_search`).
- **As três buscas no momento certo**: biblioteca → `plumb-find-docs` (também na trilha
  direta), sistema sem acesso → `plumb-find-mcps`, competência que falta →
  `plumb-find-skills`; descrições reescritas em português e inglês; o roteador as cita.
- **Setup em grill pesado**: uma pergunta por vez, dimensão de ferramentas varre
  dependências, MCPs e skills instalados e recomenda por múltipla escolha; pergunta como
  preparar um worktree novo. **Dream** recomenda a partir da sessão, com a evidência citada.
- Roteador de 10 linhas (era 7) e instrução global com grill, worktree, ferramenta de
  perguntas e as três buscas. Evals novos: G1–G3, D4, E1, W2–W6, T1, U1, R1–R4 (os antigos
  G1, U1 e R1 viraram V3, B3 e S4).

### Removido

- O comportamento "Decidir, não perguntar" e o bloco "Decidi:" da spec.
- Perguntas só em texto quando a ferramenta de perguntas existe.

## 5.0.0

O Plumb passa a **entrar em todo pedido**, o cérebro passa a **entrar em toda fase**, e
o agente `plumb-dreamer` sai: quem decide o que guardar é o orquestrador, que tem a
conversa. As skills são reescritas para o modelo do Knowledge OS v2 (`change/brain-v2`):
cinco tipos com subtipo, `scope` herdado, `origin`, tags gerenciadas, relações e grafo,
`item_feedback`.

### Quebras de compatibilidade

| Antes | Agora |
|---|---|
| a skill `plumb` só para **mudança** de código e dispara a critério do modelo | hook `UserPromptSubmit` injeta o lembrete em **toda** mensagem; a skill atende qualquer pedido (pergunta, diretriz, investigação, hotfix, mudança, setup, dream) |
| `plumb-dreamer` (agente) | removido (o instalador apaga o do Plumb); fechamento, setup e dream são do orquestrador |
| `references/brain-items.md` | `references/brain.md`, no modelo v2 |
| item `change/<id>` (`type: spec`) | `spec/<id>`, com `status: draft` → `active` → `done` |
| tipos `insight`, `procedure`, `knowledge`, `pattern` | `rule` (subtipos code, pattern, security, business, process, decision), `howto` (`troubleshoot`), `context`, `spec`, `secret` |
| `context_get`, `vocabulary`, `backup`, `artifact`, perfil `agent` de 6 ferramentas | as 32 ferramentas do v2 (`item_search` sem consulta devolve o essencial; `item_graph`, `item_feedback`, `relation_create`, `tag_*`…) |
| workspace `Global` e project `Geral` como lugares fixos | `scope` (`scoped`, `workspace`, `global`), herdado; o item mora onde é salvo |
| keys `regra/`, `decisao/`, `padrao/`, `contexto/`, `segredo/` | `rule/`, `howto/`, `context/`, `secret/` (`<tipo>/<nome>`) |
| `npm test` com glob no script | `scripts/run-tests.mjs` (o glob não expandia no cmd do Windows nem no Node 23+) |

### Adicionado

- **Hooks de entrada** (`skills/plumb/hooks/entry.mjs`, sem dependências, nunca trava a
  sessão): `UserPromptSubmit` (roteador de 7 linhas + o caminho do transcript),
  `SessionStart` (avisa de diretrizes da sessão anterior sem gravação) e `Stop` (rede de
  segurança: bloqueia **uma vez** se o usuário enunciou uma regra e nada foi gravado).
  No Cursor, o roteador vai no `sessionStart` (o hook por prompt de lá não injeta contexto).
  `status` mostra `hook de entrada`; `uninstall` remove só os do Plumb.
- **Contrato do cérebro por fase** no `SKILL.md`: o que ler, o que gravar e que feedback
  dar em Resposta, Diretriz, Investigação, Localizar, Entender, Alinhar, Especificar,
  Construir, Provar e Aprender.
- **Fase Aprender inline**: o orquestrador testa cada candidato pelo tipo, procura
  duplicata, escolhe o destino (repositório, workspace, global), grava num `item_save` e dá
  o feedback de uso (`helped`, `irrelevant`, `wrong`, `outdated`, `verified`).
- **`/plumb-setup` como entrevista por dimensão** (`references/dimensions.md`): dez
  dimensões, uma por mensagem, `Inferi (evidência)` + `Preciso de você` com recomendação,
  sem teto de perguntas, gravação por dimensão depois do "sim", progresso retomável em
  `spec/setup-<repo>`; começa por `connection_list`, `workspace_list` e pelo que já é global.
  Inferência só com evidência direta; interpretação é pergunta.
- **`/plumb-dream` analisa a sessão inteira**: lê o transcript pelos dois lados e pelos
  erros de ferramenta com o extrator `scripts/extract.mjs`, agrupa por causa raiz e
  propõe o lote por destino com o turno de evidência. Uma fala do usuário basta; o
  inferido exige evidência. `desde <data>` despacha `plumb-explorer` por transcript;
  `auditoria` usa `knowledge-mcp report --json`.
- **Teste de contrato** (`test/contract.test.js`): falha se qualquer skill ou agente citar uma
  ferramenta do cérebro ou um conceito que o v2 não tem.
- `install` remove o `plumb-dreamer` do Plumb de instalações anteriores.

### Alterado

- Instrução global e parágrafo de Workflow do `AGENTS.md`: "todo pedido", não "toda mudança".
- Todos os agentes bloqueiam **toda** escrita no cérebro (itens, relações, tags, estrutura,
  conexões), não só três ferramentas.
- Preferência do usuário e convenção da empresa moram num project próprio do contexto
  (`preferencias` no workspace pessoal global; `compartilhado` com scope `workspace`), não
  escondidas num repositório.
- A trilha direta roda os checks (fase Provar sem despacho) e a fase Aprender olha o cérebro.

### Removido

- O `/plumb-setup` não grava mais permissões (`.claude/settings.json`, `.cursor/cli.json`,
  `.cursor/permissions.json`) e `references/permissions.md` saiu. A pergunta de push/PR da
  entrega é uma regra do fluxo; quem quiser a trava configura `permissions` por conta própria.

### Pendente

- Os casos de eval que dependem do servidor v2 ficam para depois da virada do Knowledge OS
  (`evals/cases.md`, marcados).
- Os subtipos de `howto`, `context` e `spec` passaram a constar do `brain.md`, iguais aos do
  servidor v2 (`docs/V2_MVP.md` do Knowledge OS).

## 4.0.0

Reorganização do fluxo em torno de uma **spec com fases** e de seis papéis com
fronteiras nítidas. Alinha as skills com a API atual do Knowledge OS — três
chamadas estavam quebradas em runtime.

### Quebras de compatibilidade

| Antes | Agora |
|---|---|
| `plumb-verifier` | `plumb-tester` — prova que funciona, **sem ver o diff** |
| `plumb-security` | lente do `plumb-reviewer` (`<lente>seguranca</lente>`) |
| `plumb-curator` | `plumb-dreamer` |
| skill `plumb-retro` | skill `plumb-dream` |
| item `mudanca/<id>`, `type: "task"` | item `change/<id>`, `type: "spec"` |
| item `retro/ultima` | item `dream/last` |
| keys `regra/`, `decisao/`, `padrao/`, `gotcha/`, `contexto/`, `segredo/` | `rule/`, `decision/`, `pattern/`, `gotcha/`, `context/`, `secret/` |
| `references/change-template.md` | `references/spec-template.md` |
| `type: "artifact"` | removido |

### Corrigido

- **`type: "task"` não é um tipo válido** — e o modelo canônico do plano usava
  exatamente isso: toda gravação era recusada pelo validador.
- **`context_get(project=".")`** passava um parâmetro inexistente; é `repo`, e é
  obrigatório. Mesmo erro em `item_search`, `item_get` e `item_save`.
- **`project_link(...)`** não é mais uma tool registrada (virou
  `repo(action="link")`), então os `disallowedTools` que a citavam não
  bloqueavam nada: subagentes de leitura podiam ligar repositórios.
- `domain` → `project`; a env `KNOWLEDGE_OS_TOOLSET` não existe mais.
- `npm test` quebrado no Node 24 (`node --test <dir>` não resolve diretório
  desde a 23).

### Adicionado

- **`plumb-find-mcps`** completa o trio de descoberta: *falta documentação?*
  (`find-docs`), *falta competência?* (`find-skills`), *falta acesso?*
  (`find-mcps`). As três ganham gatilho explícito no orquestrador.
- **Spec com fases** — resultados esperados trazem o "observa-se" (o roteiro do
  testador); cada fase declara papel, dependência e critério de saída. A
  dependência destrava o paralelo e responde "qual a próxima" depois de uma
  compactação. As fases **Provar** e **Aprender** são do molde.
- **Fase Alinhar** — entrevista antes de especificar, só quando o pedido é
  ambíguo num ponto que muda o que será construído *e* descobrir depois
  custaria refazer.
- **Fase Aprender em toda trilha**, inclusive na direta.
- **`plumb-dream` lê as sessões** — os transcripts têm o que o usuário
  corrigiu, repetiu ou recusou, a evidência mais honesta do que falta.
- **Entrevista de stack no setup** — onze dimensões, dois filtros (não dá para
  inferir **e** destrava uma fase), teto de 5 perguntas. Resultado em
  `context/stack`.
- **Convivência com gestor de tarefas** — card guarda o quê e o status, cérebro
  guarda o porquê, spec é a ponte. Nenhum dos dois invade o outro.
- **Políticas do cérebro que faltavam** — o que grava direto e o que pede
  aprovação; onde agrupar (workspace/project/subject); quando relacionar;
  anti-duplicata em três passos.

### Alterado

- **`pattern` redefinido**: era "a primeira vez que o projeto resolveu um tipo
  de problema" (indistinguível de `knowledge`); agora é **molde de composição**
  — "toda página de listagem tem breadcrumb, título, busca com filtro, lista
  plana e paginador". `knowledge` absorve o critério antigo.
- **Modelo por papel vira sugestão**: `model: inherit` no frontmatter e um tier
  por característica ("rápido", "equilibrado", "capaz") no corpo, que o
  orquestrador aplica. Cravar `sonnet` prendia o papel num modelo específico.
- `plumb-explorer` extrai a convenção **do código real** (três arquivos iguais
  = convenção) e reporta contradição com o que está escrito.
