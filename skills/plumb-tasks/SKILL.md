---
name: plumb-tasks
description: Runs the `tasks` phase of the Plumb flow — splits a plan into
  reviewable, dependency-ordered tasks. Called by the `plumb` orchestrator
  skill; never invoked directly from a user request.
---

# plumb-tasks

Answers: what pieces does this split into, and what can run in parallel?
Produces `tasks.md` in `.plumb/work/<id>/`, using
`.plumb/templates/tasks.md`.

## Procedure

1. Split `plan.md`'s approach into T-n tasks small enough to review as one
   commit each. A task that touches unrelated files or mixes two REQs is
   too big — split it further.
2. For each task, list: files, the REQ/AC it serves, dependencies on other
   tasks, and the command that verifies it in isolation (usually the
   project's test command scoped to the touched files).
3. Group tasks that have no dependency between them into the same
   parallelism group. Ask the human: run this group in parallel (separate
   subagents) or sequentially? Don't assume — parallelism trades speed for
   harder-to-follow output, and the human may prefer one or the other for
   this particular delivery.

## Gate

Present `tasks.md`, summarize in 3–7 lines (how many tasks, which groups
parallelize), confirm the parallel/sequential choice from step 3. On
`pass`, move to `implement`.
