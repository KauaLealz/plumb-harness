---
name: plumb
description: Spec-driven delivery flow for ANY code change in this repository:
  features, bug fixes, refactors, tickets/card ids (e.g. PAY-142), "continue
  where we stopped". Sizes the work, runs ready/specify/plan/tasks/implement/
  verify/review with human gates, and resumes from .plumb/work state. Use it
  even if the user never says "spec" or "plumb". Not for plain questions.
---

# Plumb orchestrator

The agent conducts, Plumb guides, the human approves. This skill locates or
resumes the work, sizes it, runs the phases in order, applies gates, and
closes the delivery. The phase skills (`plumb-ready`, `plumb-specify`, ...)
are only ever called from here — never trigger them directly from a user
request.

## First: is this repo set up?

- No `.plumb/` here and the user asked for code work → propose running the
  `plumb-init` skill. Don't proceed with the flow below until they agree.
- `.plumb/` exists but `plumb doctor` reports issues → propose `plumb doctor
  --fix` or `plumb setup`, depending on what's missing.
- Otherwise continue.

## Locate or resume

1. Extract an id from the request (ticket pattern from `.plumb/config.env`,
   or an explicit id the user gives). No id → derive a short slug from the
   request.
2. `plumb status` lists existing work items with their phase. If the id
   already has a `.plumb/work/<id>/`, read `state.md` and resume at
   "Próximo passo" — don't restart finished phases.
3. No existing work → `plumb new <id>` creates the work dir and `state.md`,
   **before touching any file** — this step is not optional for small
   changes; a one-line fix still gets an id and a `state.md`.

## Size it

Before any expensive phase, judge the size against
`references/sizing.md` and the project's own thresholds in
`.plumb/overlay/sizing.md`. Write the size and reason into `state.md`.
Re-judge if scope grows past ~50% mid-flow — re-sizing is cheap, finishing
the wrong-sized flow is not.

`quick` is the floor, not an escape hatch — even a one-line typo fix gets a
work item, a size, and a logged gate. Skipping the work item entirely for
"it's too small to bother" defeats the point of this skill: every code
change gets *some* record, even if the record is one line.

## Run the phases

| Fase | Pergunta que responde | Artefato | Skill |
|---|---|---|---|
| ready | A demanda está pronta para começar? | ready.md | `plumb-ready` |
| specify | O que precisa ser feito e por quê? | spec.md | `plumb-specify` |
| plan | Como fazer e como provar que funciona? | plan.md | `plumb-plan` |
| tasks | Em que pedaços dividir e o que paraleliza? | tasks.md | `plumb-tasks` |
| implement | Código e unitários, em TDD | commits | `plumb-implement` |
| verify | A solução funciona de ponta a ponta? | verify.md | `plumb-verify` |
| review | O código cumpre a spec e as regras do projeto? | review.md | `plumb-review` |

`quick` work skips `specify`/`plan` as full phases (folded into `ready` and
`verify`, one gate). `small` folds plan+tasks into the spec. See
`.plumb/overlay/sizing.md` for exactly how each size adjusts the table above.

After each phase, update `state.md` (fase atual, próximo passo, decisões) and
run the gate below before moving to the next phase.

## Gates — see `references/gates.md`

Every phase ends in pass / pass-with-risks / reject. Never advance, write to
the board, push, or open a PR without an explicit human "yes".

## Sessions, failures, models — see `references/breaker.md`

Recommend a fresh session at the specify→plan and plan→implement boundaries,
or once context is ~50%+ full. Same failure twice → stop, write
`handoff.md`, recommend a fresh session. Never switch model or toggle MCP
servers mid-session.

## Subagents — see `references/agents/`

Dispatch parallel tasks, E2E journeys, and specialized reviewers through the
prompt templates there — fixed part first, task last, for cache reuse.

## Closing a delivery

Once `review` passes and the PR is approved by the human: record durable
learnings (`plumb mem remember ... --type learning`), log the delivery
(`plumb log delivery --id <id>`), and check `plumb dream-due` — mention it
to the human if a cycle is due, don't run it uninvited.
