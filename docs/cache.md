# Prompt cache discipline

Prompt caching reuses everything up to the first difference at the start
of a conversation. Every rule below exists to protect that prefix, because
an invalidated cache costs real money and latency on every single request
for the rest of the session.

## What must never change mid-session

- **Rules and skills.** The AGENTS.md managed block and every `SKILL.md`
  are read-only during a session. The `cache-guard` hook enforces this on
  Claude Code (blocks `Edit`/`Write`/`MultiEdit` on `AGENTS.md`, `skills/`,
  `.plumb/overlay/`); the AGENTS.md rule itself carries the same
  instruction for tools without hook support.
- **The model.** Switching models mid-conversation resets the cache and
  changes reasoning style mid-task. Escalate via a subagent or a new
  session instead.
- **The MCP server set.** Same reasoning — a changed tool list changes the
  system prompt.

## Where dynamic state goes instead

Anything that changes during a session — current phase, what's been
decided, what failed — lives in a **file**, read fresh each time it's
needed, never injected into the stable prefix:

- `state.md` — phase, next step, decisions.
- `.plumb/journal.jsonl` — append-only, read by `plumb stats`/`dream-due`
  when needed, not preloaded.
- `.plumb/dream/inbox.md` — where an idea to change a rule/skill/overlay
  goes *instead of* editing it live. The dream cycle applies changes in a
  batch, between sessions — one cache invalidation per cycle, not one per
  idea.

## Why dates, counters, and examples are banned from rules/skills

A rule that says "as of 2026-09" or "attempt #3" changes every time it's
read, which defeats caching even though the *meaning* didn't change. Every
`SKILL.md` in this repo is written to be true indefinitely — if it needs a
concrete example, the example is structural (`REQ-1`, `T-n`) rather than a
literal instance that will look stale in a month.

## Subagent prompts

`skills/plumb/references/agents/*.md` all put the fixed part (role, rules,
output format) before the task. Dispatching many subagents of the same
type in one session reuses that fixed prefix across every dispatch.
