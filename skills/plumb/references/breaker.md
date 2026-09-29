# Sessions, failures, models

## Session boundaries

Recommend a fresh session:
- At the specify → plan boundary.
- At the plan → implement boundary.
- Once context usage is around 50%+ of budget.

`state.md` is what makes this safe — it always has enough (fase, próximo
passo, decisões) for a new session to resume without re-reading the whole
history.

## Circuit breaker

The same failure happening twice (same test failing the same way, same
error from the same command) means stop, not retry a third time with a
small variation. Write `handoff.md` (estado, o que falhou, hipóteses,
próximo passo) and recommend a fresh session to attack it with a clean
context.

## Models

Never switch model mid-conversation. If the current model is struggling,
escalate by opening a subagent or starting a new session with a different
model — not by asking the same model to "try harder". Where the tool
supports it, use the model tier configured per phase in
`.plumb/config.env` (`PLUMB_MODEL_TIER_PLAN`, `PLUMB_MODEL_TIER_IMPLEMENT`).
