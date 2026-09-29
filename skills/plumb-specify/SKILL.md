---
name: plumb-specify
description: Runs the `specify` phase of the Plumb flow — turns a ready
  demand into requirements and acceptance criteria. Called by the `plumb`
  orchestrator skill; never invoked directly from a user request.
---

# plumb-specify

Answers: what needs to be done, and why? Produces `spec.md` in
`.plumb/work/<id>/`, using `.plumb/templates/spec.md`.

## Procedure

1. From `ready.md` and the card, write REQ-n requirements — each with a
   source (card, human decision, memory, doc, or file:line). No REQ without
   a source; if you can't cite one, it's an open question instead.
2. For each REQ, write AC-n acceptance criteria in Given/When/Then. An AC
   should be provable, not aspirational — see `references/spec-style.md`.
3. State what's explicitly out of scope. Scope creep during `implement`
   usually traces back to a spec that left this section empty.
4. `small`-sized work: fold plan and tasks into this same document instead
   of producing separate `plan.md`/`tasks.md` — see `references/spec-style.md`
   for how that folded structure looks.

## Gate

Present `spec.md`, summarize in 3–7 lines, ask open questions. On `pass`,
move to `plan` (or `implement` directly for `small` work, since plan+tasks
are already embedded).
