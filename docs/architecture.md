# Architecture

Plumb is layered so that the expensive-to-change parts stay stable and the
cheap-to-change parts absorb project-specific detail.

```
┌─────────────────────────────────────────────┐
│ Rules (AGENTS.md managed block)              │  always active, ≤60 lines
├─────────────────────────────────────────────┤
│ Skills (skills/plumb*/SKILL.md)              │  loaded on demand, ≤200 lines
├─────────────────────────────────────────────┤
│ Overlay (.plumb/overlay/*, .plumb/map.md)    │  per-project, read by the phase that needs it
├─────────────────────────────────────────────┤
│ CLI (plumb)                                  │  deterministic work: discovery, scaffolding,
│                                               │  memory wrapper, journal, hooks
├─────────────────────────────────────────────┤
│ Hooks (.claude/settings.json)                │  real enforcement where the tool supports it
└─────────────────────────────────────────────┘
```

The rule from plan §2 this enforces: **the agent decides, the CLI
executes.** Discovery, scaffolding, journaling, and memory calls are
mechanical — they live in `src/`, get unit tests, and never require
judgment. Sizing, diagnosis, and what to ask a human are judgment calls —
they live in skill text, read by the agent at the moment they're needed.

## Repo layout (this repo — the harness itself)

```
plumb-harness/
├── bin/plumb.js          # shebang wrapper around dist/cli.js
├── src/                  # TypeScript source (commander-based CLI)
│   ├── cli.ts             # registers every command
│   ├── commands/          # one file per `plumb <command>`
│   └── lib/                # the logic commands call — this is what's unit tested
├── skills/                # plumb (orchestrator) + one dir per phase skill
├── templates/             # what `plumb scaffold` copies into a consumer's .plumb/
├── tests/                 # CLI unit tests, eval fixtures, eval case catalog
└── docs/                  # this directory
```

## Consumer project layout (what `plumb init` creates)

```
AGENTS.md                 # managed block + whatever the project already had
CLAUDE.md / GEMINI.md      # "@AGENTS.md" bridges, only created if missing
.claude/
├── skills/plumb*/          # copied from this repo's skills/, refreshed on every init/doctor --fix
└── settings.json           # Plumb's 4 hooks merged in, existing settings preserved
.plumb/
├── config.env              # KEY=value, grouped (Comandos/Board/Convenções/Gates/Custo/Testes/...)
├── plumb.lock               # harness version + tool versions this project uses
├── map.md                  # module map
├── overlay/                # ready.md, sizing.md, testing.md, review.md
├── templates/               # per-artifact templates (state, ready, spec, plan, tasks, verify, review, handoff)
├── work/<id>/               # one dir per demand: state.md, brief.md, evidence/ (gitignored)
├── journal.jsonl            # one JSON line per event (plan §17)
├── memory/                  # team memory export (`plumb mem export`)
└── dream/                   # inbox.md + evidence.md + experiments/
```

## Why the CLI is Node/TypeScript

The harness itself needed one implementation language for its own tooling
(build, test, lint). Node was picked because `npx`-style distribution and
JSON-shaped I/O (journal lines, hook stdin payloads, Claude Code's own
settings.json) are native to it — see `docs/compatibility.md` for what that
means for a consumer project in a different language (nothing: Plumb
orchestrates any stack, it just isn't written in that stack).
