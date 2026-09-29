---
name: plumb-implement
description: Runs the `implement` phase of the Plumb flow — builds each
  task in TDD and commits it. Called by the `plumb` orchestrator skill;
  never invoked directly from a user request.
---

# plumb-implement

Produces commits, one per task in `tasks.md`. Best started in a fresh
session (see `plumb/references/breaker.md`).

## Procedure

Per task, in order (or dispatched to subagents per the parallel groups from
`tasks.md` — see `references/subagents.md`):

1. Write the failing test the task's AC describes.
2. Write the minimal code to pass it — see `references/tdd.md` for what
   "minimal" means here.
3. Run lint and build scoped to what the task touched, not the whole repo.
4. Commit. One task, one commit, message references the task id.
5. Update `state.md`: task done, next task or phase.

Same test failing the same way twice → circuit breaker
(`plumb/references/breaker.md`), not a third attempt.

## Gate

`implement` doesn't gate per task — the phase gate happens once at the end,
after all tasks (or the ones the human chose to run this session) are
committed. Summarize what got built, what didn't (if anything was
descoped), and confirm before moving to `verify`.
