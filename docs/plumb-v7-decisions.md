# Plumb v7 — Log de decisões do redesenho

Registro do que o usuário **de fato decidiu** na revisão peça por peça (iniciada 2026-10-23).
O `plumb-v7-blueprint.md` é um **strawman de pesquisa**; este arquivo é a fonte da verdade
das decisões.

## Modo de trabalho
- Revisão **peça por peça**; o usuário dá a diretriz de cada componente; o agente recomenda,
  mas **não decide** nem infere o conteúdo de skills/playbooks.

## Segundo cérebro — CONFIRMADO (modelo v7, estilo Obsidian em arquivos)

**Princípio:** tudo funciona **com e sem** cérebro; caminho trivial para o agente; sem poluir
além de uma pasta; nada de tipificação nem regras de schema sobre os itens.

- **Formato:** markdown **livre, customizável como Obsidian** — arquivos, pastas, tags e links à
  vontade. **Sem tipos fixos** (saem `rule`/`howto`/`context`/`work`/`secret`) e **sem regras de
  schema** sobre os itens.
- **Duas camadas (a camada global/workspace é mantida):**
  - **Projeto:** pasta **`.plumb/` commitada no repo**. Layout-padrão: `.plumb/knowledge/rules.md`
    (regras + howtos globais do projeto) ramificando em **subpastas por assunto/área, um arquivo
    por item** (ex.: `.plumb/knowledge/pagamentos/estorno-parcial.md`). Rearranjável pelo usuário.
  - **Global (usuário):** pasta equivalente na raiz do usuário (padrão `~/.plumb/knowledge/`) para
    o pessoal/transversal (idioma, estilo, preferências).
- **Visibilidade:** o agente vê **global + projeto atual**; lê os markdowns **direto** (sem MCP);
  funciona igual se a pasta não existir.
- **`work` fora do cérebro:** spec + estado de execução (fases, progresso, `feature_list`) são
  **git/worktree-native**. Handoff cross-máquina via card/tracker ou push da branch.
  - Coordenação multi-agente e "continua o X": `git worktree list` + progresso na worktree +
    `git diff --name-only` + card.
  - "Specs ativas no início da sessão": de git/card, não do cérebro.
- **knowledge-os:** **aposentado como motor do Plumb**; fica **opcional**, sugerido no
  `plumb-setup` via `plumb-find-mcps` para quem quiser servidor/busca/UI por cima dos arquivos.
- **Consulta ao cérebro** = ler os arquivos nativos; **proporcional ao score** (trivial pode pular).

### Cascatas a tratar nas skills (decorrem do acima)
- `plumb-capture` grava nota markdown em `.plumb/knowledge/<área>/`.
- `plumb-answer`/`-investigate` leem `.plumb/knowledge/` (projeto + global) direto.
- `plumb-setup` gera a pasta `.plumb/` e o layout-padrão; sugere knowledge-os via find-mcps.
- `plumb-reflect` escreve aprendizados como markdown; sem `item_save`/MCP.
- Fronteira `context` ↔ `AGENTS.md`: comandos ficam no `AGENTS.md`; conhecimento no `.plumb/`.
- Pacote do `SessionStart`: passa a resumir o `.plumb/knowledge/` (resumo barato), não o MCP.

## Provisório (do grill macro anterior — reconfirmar no contexto de cada peça)
Score de complexidade rege a cerimônia · trilha direta sem spec no trivial · grill sequencial
máx. 5 · converge + evals · "observa-se" falsificável + EARS no crítico · spec-lint · standards/
constitution + skill-creator · hooks como hoje · regras full+resumo · alvos Claude Code + Cursor.

## Fluxo e passos — CONFIRMADO

**Modelo composável:**
- A **rota** escolhe o fluxo por situação. **Não existe "um fluxo"**; o de código é o mais pesado.
  **Entregáveis não-código (documentação, respostas, etc.) são de primeira classe**, com fluxos
  curtos próprios.
- **Cada passo é uma skill chamável sozinha**; o orquestrador os **encadeia** numa mudança inteira.
  Você entra em qualquer ponto (ex.: `/plumb-qa` ou `/plumb-review` sobre código já feito).
- **Todas as skills serão refeitas do zero** no v7.

**Os 8 passos (nomes strawman, a refinar no conteúdo):**
`explore` · `grill` · `spec` (modo *design* quando complexo) · `build` · `qa` (evals quando houver
LLM) · `review` (inclui o eixo de fidelidade à spec — ex-`verify`/converge) · `learn` (inclui o
skill-creator) · `ship`.
- `design` **dobrado** em `spec`; `verify`/converge **dobrado** em `review` + `qa`. Loop
  "construir ↔ conferir" fica no orquestrador.
- A cerimônia de cada passo escala pelo **score**.

## Conteúdo dos passos — em andamento

### `explore` — CONFIRMADO
- **Primitivo interno** de leitura (não é skill chamável): subagentes de leitura em paralelo em
  área grande, **profundidade proporcional ao score**, devolve mapa curto com `arquivo:linha`.
- Usado por dentro de grill/spec/build.
- **A leitura do usuário vira `plumb-ask`** — funde `answer` + `investigate` numa skill só
  (pergunta rápida ou investigação funda; só leitura; usa `explore` por dentro).

### `grill` — CONFIRMADO
- **Amplitude julgada pelo agente:** ele decide **nº de rodadas, tema de cada rodada e nº de
  perguntas por rodada**, com base no que ficou **ambíguo, no que não faz sentido inferir, ou é
  perigoso inferir**. Rodadas por tema; múltiplas rodadas permitidas. *(Substitui o "sequencial
  máx. 5" rígido.)*
- **Encerra** quando a árvore de decisões esgota / ambiguidade baixa (só restam decisões que não
  mudam o resultado ou cujo erro não custa refazer).
- Recomendação primeiro; **toca de volta o entendimento** no fim; **não grava nada durável**
  (alimenta o spec). Chamável sozinho (`/plumb-grill <tema>`).

### `spec` — CONFIRMADO
- **Git/worktree-native:** arquivo `.plumb/work/<id>.md` **commitado na branch**, removido/squashed
  **antes do merge** (viaja via push p/ handoff, revisável no PR, não polui a main).
- **Template** (refeito pelo usuário — sem Design, sem seção Ciclo de vida):
  - Cabeçalho: `Score (sinais) · Branch · Estado (construindo|provando|pronto) · Atualizado`.
  - `## Objetivo` (abordagem escolhida em 1 linha, quando houve) · `## Combinado (do grill)` ·
    `## Fora de escopo`.
  - `## Resultados esperados` — checkbox `[ ]`, cada um com `observa-se:` (+ EARS no crítico).
  - `## Fases / waves` — checkbox, `<nome> · <arquivos> · dep: · sai quando:`.
  - `## Evidências` — **cada agente que trabalha registra a sua** (build/qa/review).
  - `## Notas / handoff` — o que uma sessão nova lê para continuar.
- **Acompanhamento do trabalho** embutido: cabeçalho (Estado/Atualizado) + checkboxes + Notas.
  "Continua o X" lê esse arquivo.
- **Ciclo de vida** não é seção: entra como **fases** guiadas pelos playbooks (ex.: fase
  "migração" com critério de rollback).
- **spec-lint** (reprova spec vaga: sem `observa-se`, sem `sai quando`, com `[A DEFINIR]`) +
  **gate de aprovação** antes do build.

### `build` — CONFIRMADO
- Implementa cada fase/wave **no worktree**, **só nos arquivos declarados**, **commit atômico por
  fase**, **atualiza o acompanhamento** (checkbox + evidência na spec). Fases independentes em
  **paralelo (waves)** via `plumb-implementer`. Chamável sozinho. Orquestrador roda o `sai quando`.
- **TDD:** teste primeiro por padrão (RED-GREEN-REFACTOR); onde TDD unitário não cabe (UI, infra,
  migração), **o playbook define a prova** (E2E, dry-run, rollback testado).

### `qa` — CONFIRMADO
- Prova cada **resultado esperado** da spec com **evidência executada** e marca `[x]`; **não vê o
  diff** (prova pelo esperado, não pelo escrito); registra evidência na seção Evidências; chamável
  sozinho sobre código existente.
- **Escada de prova (piso por natureza, nunca só unitário):** cosmética→visual; back→≥integração;
  back que impacta front→E2E do fluxo; dados/migração→migração+rollback em banco de teste;
  fila→mensagem real+idempotência+DLQ; API→contrato+impacto no consumidor; LLM→evals.
- **Playbook↔prova:** cada playbook declara `## Prova mínima` (piso + como rodar + o que observar);
  o `qa` roda a **união** dos pisos dos playbooks carregados e nunca fica abaixo; **escala acima**
  pelo score. Piso é declarado (não adivinhado); a flexibilidade é só em quanto escalar acima.

### `review` — CONFIRMADO
- **Lê o diff, não roda nada.** Dois eixos: **A) fidelidade à spec** (ex-`verify`/converge:
  gaps `faltando`/`parcial`/`contradiz`/`não pedido`) · **B) correção + convenções**. **Lente de
  segurança** em área sensível. Contexto fresco (não viu o build).
- **Uma skill, dois modos:** próprio working diff (passo do fluxo) ou PR de terceiro (avulso).
- **Só reporta; o usuário decide todas as correções** (nada auto-corrige). *(Reverte o "corrige
  bloqueador/major na hora" do v6 — escolha de controle do usuário.)*

### `learn` — CONFIRMADO
- Ao fechar a mudança (e chamável sozinho), captura o que dura como markdown em
  `.plumb/knowledge/` e **propõe novas skills/playbooks** (skill-creator).
- **Captura:** ditado grava direto; **inferido pede o "sim"**; destino pelo alcance (projeto
  `.plumb/knowledge/<área>/` vs global `~/.plumb/knowledge/`, global pede o "sim"); lê antes de
  escrever (anti-duplicata); proporcional (no trivial não força item).
- **Skill-creator:** quando a sessão improvisou uma capacidade ou repetiu um procedimento que
  mereceria skill/playbook, **propõe**; só persiste com o "sim" (guardado, como o find-skills).
- **learn** (fecho de cada mudança) e **reflect** (retro da sessão inteira) são **separados**.
- **`capture` fundido no `learn`:** não há skill separada de captura. O `learn` é a **única skill
  de escrita de conhecimento** e cobre: (a) **captura instantânea** de regra ditada pelo usuário
  ("sempre X" → grava na hora, confirma em uma linha), (b) **síntese** no fecho da mudança,
  (c) **skill-creator**. `reflect` (retro da sessão) segue à parte.

### `ship` — CONFIRMADO
- **Rodada final de dúvidas/ajustes, repetida até você dizer 100%**; só então, numa escolha só:
  **o que sai da máquina** (push / PR com título+corpo / merge local / deixar) e **limpar o
  worktree** (com o "sim"). Trilha direta / sem git: sem rodada — diz onde ficou e termina.
- **Saída:** no merge, o `.plumb/work/<id>.md` é **removido/squashed** (não polui a main); se há
  tracker conectado, o **card é atualizado** (status/resumo).

### Demais skills — CONFIRMADO (parcial)
- **`plumb-ask`** (funde `answer`+`investigate`): só leitura, usa `explore`, lê `.plumb/knowledge/`
  (projeto+global); escala de resposta rápida a investigação funda; não grava.
- **`plumb-plan`**: `explore`→`grill`→`spec` (design quando complexo) e **para antes do build**;
  mesma maquinaria do `change`. O `change` retoma dessa spec.
- **`plumb-document`**: doc do **comportamento atual** para humanos → **repo** (README, `docs/`),
  separado do `.plumb/knowledge/` (que é o cérebro do agente).

### `plumb-init` (ex-`setup`) — CONFIRMADO
- **Renomeado** `setup` → `init`.
- **Faz (por repo):** gera `.plumb/`, escreve o bloco de comandos no `AGENTS.md` (+`CLAUDE.md`),
  **sugere MCPs/playbooks por sinais** (instala só com o "sim"; hooks globais ficam no instalador).
- **Estrutura inicial:** esqueleto **+ seed após exploração e grill** (explora e grila, depois
  pré-preenche o `.plumb/knowledge/` com o inferido-confirmado).
- **Entrevista adaptativa:** o agente decide dimensões/rodadas pelo que o repo não responde
  (estilo do grill novo), mostrando inferências com evidência.
- **Três modos, auto-detectados:** projeto novo (propõe base com porquê) · brownfield (migra
  regras/skills em arquivo para `.plumb/` e enxuga) · já-configurado (auditoria).

### Standards / override — CONFIRMADO (adaptar à rotina do dev/empresa)
- **Tudo que o harness formata é um default sobrescrevível:** template de spec, formato de
  evidência, escada de prova, estilo de doc, template de PR/commit, definição de pronto.
- **Precedência:** `.plumb/knowledge/` do **projeto** → **global** (`~/.plumb/knowledge/`) →
  **default do harness** (o mais específico vence). O harness se adapta, não impõe.
- **Regras de empresa/cliente moram no próprio repo**, dentro de `.plumb/knowledge/` (não há
  camada física separada de empresa; são parte do knowledge do repo).
- O **`plumb-init` captura o modelo da empresa/dev** (explora docs/PRs/evidências + grila: "tem
  template de doc? formato de evidência? definição de pronto? convenção de PR?") e grava como
  override.

### `reflect` e `find-*` — CONFIRMADO
- **`plumb-reflect`:** retro da sessão inteira via transcript; propõe aprendizados + skills;
  modos `desde <data>` (varre sessões) e `auditoria` (saúde do `.plumb/knowledge/`); grava lá;
  distinto do `learn`.
- **`plumb-find-docs`:** doc atual de lib (Context7) antes de codar.
- **`plumb-find-mcps` e `plumb-find-skills` = "achar-OU-criar":** além de sugerir um recurso
  existente, **criam** um novo quando não houver (skill nova; MCP sob medida), **guardado**
  (revisado, com o "sim"). Compartilham o mecanismo de autoria de skill com o skill-creator do
  `learn`/`reflect` (gatilhos diferentes: find-* = lacuna prospectiva no trabalho; learn/reflect =
  aprendizado retrospectivo).

### Orquestrador — REMOVIDO (coreografia)
- **Sem skill `change`.** A orquestração se distribui: **regra de roteamento** (classifica →
  skill de entrada) · **triagem** (score/trilha/playbooks, aplicada no início, gravada no
  cabeçalho da spec) · **spec como estado** + cada skill **aponta a próxima** · **regras** para o
  loop build↔qa/review, o replanejamento (escopo novo → volta ao grill) e a rodada final (no
  `ship`). **O modelo no loop principal orquestra**, guiado pelas regras + estado da spec.
- **Bandas de score → trilha:** 1–2 direta · 3–5 padrão · 6–8 profunda · 9–10 programa/greenfield.

### Playbooks, regra vs skill, inventário — CONFIRMADO

**Playbook = a expertise de cada skill (um por skill).** Cada skill = `SKILL.md` (procedimento
enxuto) + `playbook.md` (a expertise profunda: "como fazer bem", lida quando a skill roda).
- O **ciclo de vida fica distribuído em fatias** dentro dos playbooks das skills onde é útil — ex.:
  migração aparece no playbook do `plumb-code` (como fazer + rollback), do `qa` (prova:
  migração+rollback), do `spec` (seções a criar). **Não há playbook central por área.**
- **Sem biblioteca built-in de playbooks separada**; a expertise é built-in dentro de cada skill,
  e o específico do projeto/empresa entra como **regra** ou **skill nova** (abaixo).

**Regra vs skill (critério):**
- **Regra** (`.plumb/knowledge/`): restrição/convenção/preferência declarativa, sempre-ligada, que
  ajusta como as skills agem (ex.: "evidência inclui screenshot", "conventional commits", template
  que é só **formato**). Entra pela precedência projeto → global → default.
- **Skill** (nos skills): capacidade/procedimento invocável com passos próprios (ex.: processo de
  release da empresa, gerador de relatório, template que é um **processo**). Criada via `find-skills`
  (guardado) quando a empresa precisa.

**Inventário final de skills (v7):**
- **Leitura:** `plumb-ask` (funde answer+investigate).
- **Passos (coreografados, chamáveis sozinhos):** `plumb-grill` · `plumb-spec` · **`plumb-code`**
  (ex-`build`) · `plumb-qa` · `plumb-review` · `plumb-learn` (inclui capture + skill-creator) ·
  `plumb-ship`.
- **Planejar/documentar/preparar:** `plumb-plan` · `plumb-document` · `plumb-init` (ex-`setup`).
- **Sessão:** `plumb-reflect`.
- **Lacunas de ferramenta:** `plumb-find-docs` · `plumb-find-mcps` (achar-ou-criar) ·
  `plumb-find-skills` (achar-ou-criar).
- **Primitivo (não é skill):** `explore`.
- **Removidos:** `change` (→ coreografia), `capture` (→ learn), `design` (→ spec), `verify`
  (→ review+qa), `answer`/`investigate` (→ ask).
- Cada skill: `SKILL.md` + `playbook.md`.

### Hooks e contexto — CONFIRMADO
- **`UserPromptSubmit`:** carrega **roteamento** (classifica → skill de entrada) + **triagem**
  (como calcular score/trilha/playbooks). Essencial agora que não há orquestrador.
- **`SessionStart`:** injeta o pacote do **`.plumb/knowledge/`** (só os **resumos**) + o trabalho
  ativo via **git** (`git worktree list` / specs na branch).
- **`Stop`:** rede de segurança leve (ex.: regra ditada sem gravar).
- **Regras em dois tamanhos:** cada nota tem **resumo (frontmatter) + corpo**; o SessionStart
  carrega os resumos, o corpo entra sob demanda. Orça o contexto fixo.

### Provisórios reconfirmados
spec-lint (no `spec`) · evals (no `qa`) · EARS no crítico (nos resultados) · longa duração
(feature_list/progresso/init.sh/E2E na banda programa) — **confirmados** na arquitetura nova.

## Status: revisão peça por peça COMPLETA ✅ → montar o blueprint final.
4. Demais skills da espinha (capture, setup, find-docs/mcps/skills) — `answer`+`investigate` já
   fundidos em `plumb-ask`.
5. Playbooks de ciclo de vida.
