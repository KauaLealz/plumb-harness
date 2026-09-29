# Skill evals

Plan §12.8 asks for 3–5 objective-criteria cases per skill, run across 3
example repos (web, API, mobile) and at least two AI tools.

**Scope actually built so far:** one fixture (`tests/fixtures/example-api`,
Node/Express) and Claude Code only, since that's the tool available to
verify against in this environment. Web and mobile fixtures, and Cursor
runs, are not built yet — tracked as gaps below, not silently skipped.

Each case: a scenario, the exact prompt given to the agent, and pass/fail
criteria a human (or a future `plumb doctor --agents --live`-style runner)
can check without judgment calls.

## Orchestrator (`plumb`)

### O1 — repo without `.plumb/` offers to set it up
- Fixture: `example-api`, `.plumb/` removed.
- Prompt: `"implementa o PAY-142"`
- Pass: response proposes running Plumb setup / `plumb-init` before doing
  any code work. Fail: it starts editing code, or answers as a plain
  question.

### O2 — quick-sized task skips specify/plan as full phases
- Fixture: `example-api`, `.plumb/` present.
- Prompt: `"corrige o typo 'recieved' para 'received' no comentário de src/server.js"`
- Pass: response sizes the task `quick` and does not produce full
  `spec.md`/`plan.md` artifacts — folds ready+verify into one gate. Fail:
  it runs the full ready→specify→plan→tasks sequence for a 1-line fix.

### O3 — resumes existing work instead of starting over
- Fixture: `example-api`, `.plumb/work/PAY-142/state.md` present with
  `Fase atual: plan`.
- Prompt: `"continua o PAY-142"`
- Pass: response reads `state.md` and resumes at `plan`, doesn't restart at
  `ready`. Fail: it re-runs `ready`/`specify` from scratch.

## `plumb-ready`

### R1 — card without acceptance criteria blocks with numbered questions
- Fixture: `example-api`, card = the PAY-142 README section (no AC).
- Pass: `ready.md` (or the response) is `blocked`/has open questions,
  numbered, each with a suggested answer. Fail: it invents acceptance
  criteria on its own and proceeds.

### R2 — well-specified card passes ready cleanly
- Fixture: `example-api`, card = PAY-142 plus a full REQ/AC list given in
  the prompt.
- Pass: `ready.md` shows all checklist items `ok` with evidence, no
  blocking questions. Fail: it still asks about something the prompt
  already answered.

## `plumb-plan`

### P1 — feature spanning back and front includes an E2E test strategy entry
- Fixture: `example-api` (treated as having a front for this scenario, per
  the prompt).
- Pass: `plan.md`'s testing strategy includes at least one E2E-level TS-n
  entry. Fail: only unit-level entries for a change described as
  cross-layer.

### P2 — text-only change proposes no new tests
- Fixture: `example-api`.
- Prompt: `"corrige o texto da mensagem de erro em POST /payments para 'Invalid amount'"`
- Pass: `plan.md`'s testing strategy section is empty or explicitly says no
  new test is needed. Fail: it proposes new unit/integration/E2E tests for
  a pure copy change.

## `plumb-verify`

### V1 — AC without a passing proof fails the phase
- Fixture: `example-api`, a plan.md with an AC whose TS-n scenario is run
  and fails.
- Pass: `verify.md`'s AC→TS matrix shows that AC as failed and the overall
  gate result is not `pass`. Fail: the phase reports success despite the
  failing proof.

## `plumb-init`

### I1 — inferred facts are confirmed in one block, not one question each
- Fixture: `example-api`, fresh `.plumb/` from `plumb init`.
- Pass: response presents detected facts (language, test framework, ...) as
  one confirmation block, then asks only what's genuinely unknown. Fail: it
  asks the human to re-state facts `plumb discover` already found.

## Known gaps

- No web or mobile fixture yet — `plumb-plan`'s diagram case and
  `plumb-verify`'s Maestro/mobile case aren't covered.
- No Cursor run yet — every case above has only been exercised (where
  marked "ran live" in `results.md`) against Claude Code.
- `plumb-tasks`, `plumb-implement`, `plumb-review`, and `plumb-dream` don't
  have cases yet.
