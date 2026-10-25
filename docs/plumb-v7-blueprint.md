# Plumb v7 — Blueprint

> Status: **aprovado em revisão peça por peça** (2026-10-23). Desenho fechado com o usuário,
> decisão por decisão (log em `plumb-v7-decisions.md`). Entrega desta sessão é o desenho; a
> construção vem depois, em fases (§13).

Plumb v7 é um harness de desenvolvimento **fullstack** e **spec-driven** para o Claude Code (e
Cursor). Redesenho guiado por três princípios do usuário: **funciona com e sem o segundo cérebro**,
**sempre o caminho mais fácil e eficiente para o agente**, e **se adapta à rotina do dev/empresa**
em vez de impor a dela.

## 1. Princípios

1. **Todo pedido passa pelo Plumb**, roteado por situação (um hook lembra a cada mensagem).
2. **Spec-driven com cerimônia proporcional:** o trabalho não-trivial roda de uma **spec** nascida
   de um **grill**; o trivial corrige direto. A amplitude escala por um **score de complexidade**.
3. **Ciclo de vida completo** (código, testes, deploy, banco, filas, observabilidade) é cidadão de
   primeira classe — distribuído como expertise dentro das skills.
4. **Prova antes de pronto**, no nível certo (nunca só teste unitário).
5. **O harness se retroalimenta** (learn + reflect + skill-creator).
6. **Funciona com e sem o cérebro.** O cérebro é camada de conhecimento, não dependência de runtime.
7. **Adapta-se ao dev/empresa:** tudo que o harness formata é um default sobrescrevível.
8. **Alvos:** Claude Code (prioritário) + Cursor.

## 2. Arquitetura geral — coreografia, não orquestração

Não há skill orquestradora (`change` foi removida). **O modelo no loop principal orquestra**,
guiado por:
- **Regra de roteamento** (no `UserPromptSubmit`): classifica o pedido → skill de entrada.
- **Triagem** (no `UserPromptSubmit`): como calcular o **score** e escolher a **trilha**/playbooks;
  o resultado é gravado no cabeçalho da spec.
- **A spec como estado compartilhado:** o que foi feito, o que falta; cada skill termina
  **apontando a próxima**.
- **Regras transversais:** loop `plumb-code ↔ qa/review`, replanejamento (escopo novo → volta ao
  grill), rodada final (no `ship`).

**Score → trilha:**

| Score | Trilha | Roda |
|---|---|---|
| 1–2 | direta | sem grill/spec: corrige, roda os checks, reporta (o `learn` ainda considera) |
| 3–5 | padrão | grill → spec → aprovação → worktree → code → qa → review → learn → ship |
| 6–8 | profunda | + design na spec, lente de segurança, EARS no crítico, spec-lint estrito |
| 9–10 | programa/greenfield | + longa duração (feature_list, progresso, init.sh, E2E), waves |

**Sinais do score:** amplitude (arquivos/módulos), risco (auth/pagamento/dado/contrato/migração/
infra), incerteza, novidade (greenfield), raio de impacto (produção/entre serviços/async),
reversibilidade.

## 3. O segundo cérebro — Obsidian em arquivos

- **Formato livre, sem tipos fixos e sem regras de schema** — customizável como Obsidian (arquivos,
  pastas, tags, links à vontade).
- **Duas camadas físicas:**
  - **Projeto:** `.plumb/` **commitada no repo**. Layout: `.plumb/knowledge/rules.md` (regras
    globais do projeto) ramificando em subpastas por área, **um arquivo por item**
    (`.plumb/knowledge/pagamentos/estorno-parcial.md`). Rearranjável.
  - **Global (usuário):** `~/.plumb/knowledge/` para o pessoal/transversal.
- **Regras de empresa/cliente moram no próprio repo** (dentro de `.plumb/knowledge/`).
- **Visibilidade:** o agente vê **global + projeto**, lê os markdowns **direto**; funciona igual se
  a pasta não existir.
- **Cada nota:** resumo (frontmatter) + corpo. O `SessionStart` carrega **só os resumos**; o corpo
  entra sob demanda.
- **`knowledge-os` aposentado como motor**; segue **opcional**, sugerido no `plumb-init` via
  `find-mcps` para quem quiser servidor/busca/UI por cima dos mesmos arquivos.
- A **spec e o estado de execução não ficam no cérebro** — são git/worktree-native (§6).

## 4. As skills

Cada skill = **`SKILL.md`** (procedimento enxuto) + **`playbook.md`** (a expertise: "como fazer
bem", lida quando a skill roda). O **ciclo de vida fica em fatias** dentro dos playbooks (migração
aparece no playbook do `plumb-code`, do `qa`, do `spec`) — **sem playbook central por área**.

**Inventário:**
- **Leitura:** `plumb-ask` — funde answer+investigate; só leitura; usa `explore`; escala de
  resposta rápida a investigação funda.
- **Passos (coreografados, chamáveis sozinhos):**
  - `plumb-grill` — entrevista até entendimento; **o agente decide rodadas/temas/perguntas** pelo
    que ficou ambíguo/perigoso/não-inferível; recomendação primeiro; toca de volta o entendimento;
    não grava.
  - `plumb-spec` — escreve a spec do grill (design embutido quando complexo); spec-lint + aprovação.
  - `plumb-code` (ex-`build`) — implementa no worktree, só arquivos declarados, commit atômico,
    waves em paralelo; **teste primeiro por padrão** (playbook define a prova onde TDD não cabe).
  - `plumb-qa` — prova cada resultado, **não vê o diff**; escada de prova por natureza (nunca só
    unitário); evals quando há LLM.
  - `plumb-review` — lê o diff (não roda nada): eixo A fidelidade à spec (ex-verify/converge), eixo
    B correção/convenções, lente de segurança; **uma skill, dois modos** (próprio diff / PR de
    terceiro); **só reporta, o usuário decide as correções**.
  - `plumb-learn` — escreve conhecimento: **captura instantânea** de regra ditada + **síntese** no
    fecho + **skill-creator**; ditado grava, inferido pergunta; destino pelo alcance.
  - `plumb-ship` — rodada final até 100%, depois push/PR/merge + limpar worktree com o "sim"; no
    merge a spec some (squash) e o card é atualizado.
- **Planejar/documentar/preparar:**
  - `plumb-plan` — explore+grill+spec e **para antes do code**.
  - `plumb-document` — doc do comportamento atual para humanos → **repo** (README/`docs/`).
  - `plumb-init` (ex-`setup`) — gera `.plumb/` + `AGENTS.md`, entrevista adaptativa com evidência,
    **seed após explorar+grilar**, sugere MCPs/playbooks por sinais, **captura o modelo da
    empresa**; 3 modos (novo/brownfield/auditoria).
- **Sessão:** `plumb-reflect` — retro da sessão via transcript + skill-creator; modos `desde <data>`
  e `auditoria`.
- **Lacunas de ferramenta:** `plumb-find-docs` (docs de lib antes de codar) · `plumb-find-mcps` e
  `plumb-find-skills` (**achar-ou-criar**, guardado).
- **Primitivo (não é skill):** `explore` — leitura com subagentes em paralelo, profundidade pelo
  score, devolve mapa com `arquivo:linha`; usado por dentro das skills.

**Removidos do v6:** `change` (→ coreografia), `capture` (→ learn), `design` (→ spec), `verify`
(→ review+qa), `answer`/`investigate` (→ ask).

## 5. O fluxo de uma mudança

`rota → explore → grill → spec (aprovação) → plumb-code (waves) → qa + review → learn → ship`, com
cada passo escalando pelo score e a spec carregando o estado. Direta (score 1–2) pula grill/spec.
**Não existe "um fluxo"**: pergunta → `plumb-ask`; doc → `plumb-document`; etc. Entregáveis
não-código são de primeira classe.

## 6. A spec — git/worktree-native

Arquivo `.plumb/work/<id>.md` **commitado na branch**, removido/squashed **antes do merge** (viaja
via push p/ handoff; revisável no PR; não polui a main). Acompanhamento do trabalho embutido.

```
# <id> — <título>
Score: <n> (sinais) · Branch: <nome> · Estado: construindo|provando|pronto · Atualizado: <data>

## Objetivo            (abordagem escolhida em 1 linha, quando houve)
## Combinado (do grill)
## Fora de escopo
## Resultados esperados   [ ] cada um com observa-se: … (+ EARS no crítico)
## Fases / waves         [ ] <nome> · <arquivos> · dep: · sai quando:
## Evidências            cada agente que trabalha registra a sua (code/qa/review)
## Notas / handoff
```

- **spec-lint:** reprova spec sem `observa-se`, sem `sai quando`, com `[A DEFINIR]`.
- **Ciclo de vida** entra como **fases** guiadas pelos playbooks (ex.: fase "migração" com rollback).

## 7. Verificação

- **qa — escada de prova (piso por natureza, nunca só unitário):** cosmética→visual; back→≥
  integração; back que impacta front→E2E; dados/migração→migração+rollback; fila→mensagem real+
  idempotência+DLQ; API→contrato+impacto; LLM→evals. O piso é **declarado no playbook** da skill;
  o `qa` roda a **união** dos pisos aplicáveis e **escala** acima pelo score.
- **review:** dois eixos + segurança; só reporta.
- **Longa duração** (programa): `feature_list.json` (passes:false→true), `claude-progress`,
  `init.sh`, E2E real. "Clean state = mergeável."

## 8. Regra vs skill

- **Regra** (`.plumb/knowledge/`): restrição/convenção/preferência declarativa, sempre-ligada
  (ex.: "evidência inclui screenshot", conventional commits, template que é só **formato**).
- **Skill**: capacidade/procedimento invocável com passos (ex.: release da empresa, gerador de
  relatório, template que é **processo**). Criada via `find-skills` (guardado).

## 9. Adaptação ao dev/empresa (override)

Tudo que o harness formata (spec, evidência, prova, doc, PR/commit, definição de pronto) é um
**default sobrescrevível**. Precedência: **projeto → global → default do harness**. O `plumb-init`
captura o modelo da empresa (explora docs/PRs/evidências + grila) e grava como regra ou skill.

## 10. Hooks e contexto

- `UserPromptSubmit`: roteamento + triagem (essencial sem orquestrador).
- `SessionStart`: pacote do `.plumb/knowledge/` (resumos) + trabalho ativo via git.
- `Stop`: rede de segurança leve.

## 11. Infra

- **Memória** em arquivos nativos (§3); `knowledge-os` opcional.
- **Alvos:** Claude Code + Cursor. O instalador global instala skills/hooks; o `plumb-init` prepara
  cada repo.

## 12. O que muda do v6

Cérebro de tipos fixos + MCP obrigatório → **arquivos Obsidian, cérebro opcional** · spec no cérebro
(`work`) → **spec git-native, sem `work`** · orquestrador `change` → **coreografia** · grill em lote
→ **grill por rodadas, decidido pelo agente** · review corrige sozinho → **só reporta** · playbooks
por área → **playbook por skill** · `build`→`plumb-code`, `setup`→`plumb-init`, `answer`+
`investigate`→`plumb-ask`, `capture`→`plumb-learn`.

## 13. Faseamento da construção

- **Fase A — motor:** score/triagem, regra de roteamento, cérebro em arquivos (.plumb + global),
  spec git-native + spec-lint, coreografia (regras de sequência/loop/replan), hooks.
- **Fase B — skills de passo:** grill, spec, plumb-code, qa, review, learn, ship — cada uma com
  SKILL.md + playbook.md (incluindo as fatias de ciclo de vida).
- **Fase C — skills de apoio:** ask, plan, document, init, reflect, find-docs/mcps/skills.
- **Fase D — adaptação:** mecanismo de override, captura do modelo da empresa no init, criação de
  skill/MCP (find-* achar-ou-criar), skill-creator.
- **Fase E — distribuição:** instalador, paridade Cursor, evals/testes do harness, docs.

Cada fase terá a sua própria spec quando for construída.
