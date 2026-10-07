# Changelog

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
