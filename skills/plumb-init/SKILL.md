---
name: plumb-init
description: Runs Plumb's initial interview for a project right after
  `plumb init` — confirms what was auto-discovered and asks only what's
  missing. Called by the `plumb` orchestrator (or offered directly when a
  git repo has no .plumb/ yet and the user asks for code work).
---

# plumb-init

Turns `plumb init`'s raw scaffold into a project that actually knows its own
rules. Nothing gets written until the human approves the diff at the end.

## Procedure

1. Run `plumb discover` (already run by `plumb init`, but re-check if this
   is a re-run) and skim README, manifests, CI config, and obvious entry
   points. Every fact becomes either **inferred** (with the evidence: file,
   line, or command output) or **unknown** — never a guess presented as
   fact.
2. Present the inferred items as one block for confirmation, not one
   question each. The human corrects what's wrong in one pass.
3. Ask about what's still unknown, in rounds of at most 6 questions, each
   with a suggested answer. Rounds are listed in `references/interview.md`
   — skip a round entirely if a preset already answered it (see
   `references/presets.md`).
4. Cross-check `.plumb/config.env`'s "Comandos" group, board provider,
   convenções, and the testing/quality rounds against what's actually
   discoverable — don't ask what a file already answers.
5. From what the repo actually uses (remote, CI, dependencies, docker
   services), suggest connectors — see `references/catalog.md`. Nothing
   gets installed without the human's yes.
6. Show the full diff of what's about to be written — `AGENTS.md` project
   facts (≤40 lines), `.plumb/overlay/*`, `.plumb/map.md`, the mocks
   profile, config.env — and get one final approval before writing.

## What gets written

- `.plumb/config.env` — filled in per the rounds and discovery.
- `AGENTS.md`'s "Project facts" section (via `plumb doctor --fix`, which
  preserves facts already there — never hand-edit the managed block).
- `.plumb/overlay/*` — trimmed and filled from the generic templates to
  what this project actually needs (e.g. `testing.md` keeps only the
  contexts present here).
- `.plumb/map.md` — the module map, from discovery plus anything the
  interview surfaced.
- Connectors and permissions the human approved.

## Partial re-runs

The interview can be redone for just the areas that changed — e.g. only
the "Testes" round after the project adopts a new framework — instead of
starting over. Ask which round changed rather than re-asking everything.
