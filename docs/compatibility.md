# Tool compatibility

Plumb targets any AI coding tool eventually; what's actually automated
today is scoped to two.

| Layer | Claude Code | Cursor |
|---|---|---|
| AGENTS.md managed block | read via `@AGENTS.md` bridge from `CLAUDE.md` | read natively |
| Skills (`skills/plumb*/`) | installed automatically (`plumb init`/`doctor --fix` → `.claude/skills/`) | **not automated** — install path unverified |
| Hooks (cache/gate guards, journal-phase, session-start) | installed automatically (`.claude/settings.json`) | **not automated** — hook support unverified |
| Recognition without either of the above | AGENTS.md instructions alone (layer one, see below) | AGENTS.md instructions alone (layer one) |

## Why Cursor's automation is unverified rather than "coming soon"

Two claims would be easy to get wrong here: that Cursor reads a specific
skill directory, and that Cursor's hook system matches Claude Code's event
names and payload shape closely enough to reuse the same scripts. Neither
has been checked against a real Cursor install in this repo's development.
Shipping a guess as "supported" is worse than shipping nothing — a
consumer project would silently get no enforcement while believing it has
some. `plumb doctor --agents` reports Cursor's skill/hook checks as failed
with that reason attached, rather than skipping them silently.

## What still works on Cursor today

The AGENTS.md managed block is tool-agnostic markdown; Cursor reading it
natively means the "Always"/"Tools"/"Memory & cache" rules apply even
without skills or hooks installed. This is layer one from plan §6: weaker
than a triggered skill (Cursor has to be told to follow AGENTS.md, rather
than the orchestrator activating on any code-change request), but real.

## Verifying either tool

`plumb doctor --agents` checks structural wiring (files in the right
place). `plumb doctor --agents --live` goes further for Claude Code: it
actually runs `claude -p` with a short non-interactive prompt and checks
whether the response shows the orchestrator engaged. There's no Cursor
equivalent yet, for the same reason skills/hooks aren't installed for it —
verify the mechanism before automating on top of it.
