---
name: plumb-verify
description: Runs the `verify` phase of the Plumb flow — proves the
  solution works end to end against plan.md's testing strategy. Called by
  the `plumb` orchestrator skill; never invoked directly from a user
  request.
---

# plumb-verify

Answers: does the solution actually work, end to end? Produces `verify.md`
in `.plumb/work/<id>/`, using `.plumb/templates/verify.md`.

## Procedure

Stop at the first layer that fails — don't run later layers against a
broken foundation.

1. Bring up the environment and the mocks profile, with approval (this
   starts real processes/containers — confirm before running).
2. Run the unit suite.
3. Register stubs in WireMock, run the Hurl scenarios from `plan.md`'s
   TS-n entries, check state via Nautilus and calls via WireMock — see
   `references/hurl.md` and `references/wiremock.md`.
4. Run the E2E journeys (`references/journeys.md`); evidence goes to
   `.plumb/work/<id>/evidence/`, never committed.
5. Run the dependency audit if this delivery changed a dependency, and a
   perf trace if the plan flagged a performance context.
6. Build the AC → TS → execução → resultado matrix. Any AC without a
   passing proof fails the phase — no exceptions, that's the point of the
   matrix.
7. Check coverage of what changed. A flaky test gets re-run once and
   recorded as flaky either way — never silently ignored.
8. Every gap becomes a T-fix-n; loop back to `implement` for those only,
   not the whole phase sequence.
9. Crystallize journeys that passed on a critical flow — see
   `references/crystallize.md`.

## Gate

Present `verify.md` (the AC matrix is the summary), ask about any
pass-with-risk items (flaky tests, waived minimums). On `pass`, move to
`review`.
