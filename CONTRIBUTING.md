# Contributing to Plumb

## Setup

```bash
git clone https://github.com/KauaLealz/plumb-harness.git
cd plumb-harness
npm install
npm run build
npm link          # so `plumb` resolves globally while you develop
```

## Before opening a PR

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

All four need to pass. If you changed a skill, also check its line count
stays within the ~200-line budget (`wc -l skills/*/SKILL.md`) — details
that don't fit go in that skill's `references/`.

## What needs a real test, not just a description

- `src/lib/*` logic → a Vitest test in `tests/`. Side-effecting code (spawns
  a subprocess, touches the filesystem) gets a real temp dir or a mock at
  the subprocess boundary — see `docs/testing.md`.
- A skill's behavior claim → a case in `tests/evals/cases.md`, and ideally
  actually run once (`docs/testing.md` explains how) with the result
  logged in `tests/evals/results.md`. A skill change that "should" work
  differently but was never run against a real prompt is a claim, not a
  fix.

## Editing AGENTS.md's managed block

`src/lib/agentsBlock.ts` is the source of truth — don't hand-edit example
output. Keep the block's fixed part well under the ~60-line budget (plan
§12.1); if you're adding a rule, ask whether it belongs there or in an
overlay template instead (`.plumb/overlay/*` is per-project and doesn't
compete for that budget).

## Scope discipline

This repo tracks a specific plan closely (see the project's own memory of
it, or ask). If you're adding something the plan doesn't call for, open an
issue first — the smallest-coherent-change principle applies to the
harness's own development, not just the projects it manages.

## Security

Found a real vulnerability (not a design disagreement)? Don't open a
public issue — open a GitHub private security advisory on this repo
instead, so it isn't public before there's a fix.
