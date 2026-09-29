---
name: plumb-ready
description: Runs the `ready` phase of the Plumb flow — checks whether a
  demand is ready to start work. Called by the `plumb` orchestrator skill;
  never invoked directly from a user request.
---

# plumb-ready

Answers: is the demand ready to start? Produces `ready.md` in
`.plumb/work/<id>/`.

## Procedure

1. Read the checklist in `.plumb/overlay/ready.md` — it's the project's own
   list of what "ready" means here, each item with how to verify it and
   what to ask if it's missing.
2. For each item, check it against the card/request and the codebase.
   Status is `ok` (with evidence: card field, doc link, file:line) or
   `faltando`.
3. Anything missing becomes a numbered question with a suggested answer —
   see `references/evidence.md` for what makes a good suggested answer.
4. `quick`-sized work: this phase is lighter — check only what's needed to
   start safely, not the full checklist.

## Gate

Present `ready.md`, summarize in 3–7 lines, ask the open questions. On
`pass`, mark the phase done in `state.md` and move to `specify` (or straight
to `verify` for `quick` work). On `reject`, revise `ready.md` — don't move
on with known gaps.

If a question needs an answer from outside the conversation (e.g. a missing
field on the card), propose the exact comment to post and wait for approval
before posting it — see `plumb/references/gates.md`.

## Versioning

First pass is v1. If the gate comes back with new answers that change the
checklist, write v2 rather than editing v1 away — the history of what was
unknown and when it got answered is itself useful evidence later.
