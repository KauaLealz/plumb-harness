---
name: plumb-plan
description: Runs the `plan` phase of the Plumb flow — turns a spec into an
  approach, detected contexts, and a testing strategy. Called by the `plumb`
  orchestrator skill; never invoked directly from a user request.
---

# plumb-plan

Answers: how to build it, and how to prove it works? Produces `plan.md` in
`.plumb/work/<id>/`, using `.plumb/templates/plan.md`. Best started in a
fresh session (see `plumb/references/breaker.md`) — this phase reads a lot
of code and a clean context keeps that from crowding out the actual plan.

## Procedure

1. Read `.plumb/map.md` first — it's the cheap map of the codebase. Only
   fall back to exploring live code (Serena symbol tools if available,
   otherwise direct reads) for what the map doesn't answer.
2. For any external library the change touches, check Context7 (or the
   library's own current docs) before relying on memory — library APIs
   drift faster than training data.
3. Detect the contexts this change touches (lógica de negócio, API pública,
   banco, serviço externo, pagamento, ...) against
   `.plumb/overlay/testing.md`'s context table. This drives the testing
   strategy in step 5 — see `references/testing-policy.md`.
4. Write the approach: what changes, where, and how it's linked to each
   REQ. Note contracts, data, and migrations explicitly — "n/a" is fine,
   silence is not.
5. Write the testing strategy: TS-n entries, one per AC, at the level the
   detected contexts require (`references/testing-policy.md`). Integration
   and E2E entries are natural-language scripts (steps + expected result) —
   `verify` executes them later, don't write test code here.
6. `large`/`complex` work: generate an architecture diagram (Excalidraw, if
   configured) — see `references/diagrams.md`. Smaller work: skip it.
7. Write risks and a rollback note.

## Gate

Present `plan.md`, summarize in 3–7 lines (approach + contexts + test
budget), ask open questions. On `pass`, move to `tasks`.
