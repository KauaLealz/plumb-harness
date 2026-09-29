# E2E journeys

Run each E2E TS-n script from `plan.md` against the real running
application (Playwright CLI for web, Maestro for mobile). Dispatch one
`journey-runner` subagent per journey when there's more than one
(`plumb/references/agents/journey-runner.md`).

Evidence (screenshots, network capture, terminal output) goes to
`.plumb/work/<id>/evidence/`, which is gitignored — never committed, but
kept for the human reviewing the gate.

A journey that fails partway: report exactly which step and what was
expected vs. observed. Don't retry silently — a flaky journey is still
worth recording as flaky (see the main SKILL.md's step 7).
