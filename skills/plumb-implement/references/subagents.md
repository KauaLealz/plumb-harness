# Distributing tasks to subagents

Only when `tasks.md` groups tasks as parallel and the human confirmed
parallel execution at the `tasks` gate. Dispatch one `implementer` subagent
per task in the group (`plumb/references/agents/implementer.md`), all at
once, and wait for all of them before moving to the next group.

A subagent that reports a failure doesn't get retried automatically —
surface it and let the same circuit-breaker rule apply (same failure twice
→ stop, handoff.md). Don't dispatch the next group until the current one's
commits are in and passing their own verification command.
