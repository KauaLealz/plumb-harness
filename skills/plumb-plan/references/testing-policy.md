# Testing policy for plan

Read `.plumb/overlay/testing.md` for the project's own context table and
critical flows — this file only covers how to use it.

## Reuse before creating

Before writing a new test, check what already covers the behavior. Extend
an existing test if it's close. Only create a new one if neither running
nor extending gets you the proof you need. This order (reuse → extend →
create) applies at every level, not just E2E.

## Minimums are a floor, not a target

The size's integration/E2E budget (`.plumb/overlay/testing.md`, "Reuso e
orçamento") sets how much *new* testing this size buys. The per-context
minimum (same file, "Mínimos por contexto") is the floor regardless of
size — going under it needs an approved, recorded waiver, not a silent
skip.

## One behavior, one level

Don't prove the same behavior at both the unit and the E2E level — pick the
level the context table says and prove it there. E2E covers the happy path
and the most expensive failure, nothing else needs journey-level coverage.
Don't test generated code or third-party libraries.
