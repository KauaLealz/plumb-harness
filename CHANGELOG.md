# Changelog

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

### Pendente

- Os casos de eval que dependem do servidor v2 ficam para depois da virada do Knowledge OS
  (`evals/cases.md`, marcados).
- Os subtipos válidos de `howto` e `context` (além de `troubleshoot` e `environment`) dependem
  da taxonomia final do servidor; as skills mandam escolher pelo erro, que lista os válidos.

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
