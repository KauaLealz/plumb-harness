# Gates

Every phase ends here before the next one starts. A gate is not a
formality — it's the point where a human catches a wrong assumption before
it compounds into wasted work three phases later.

## Protocol

1. Present the phase's artifact (ready.md, spec.md, plan.md, ...).
2. Summarize it in 3–7 lines — what it says, not a restatement of the whole
   file.
3. Ask any open questions, numbered, each with a suggested answer the human
   can just confirm instead of typing from scratch.
4. Wait for an explicit "yes" (or equivalent). Silence, "ok continue" to a
   different question, or moving on to unrelated conversation is not a yes.
5. Record the result: `pass`, `pass-with-risks` (proceeds, risk noted in
   state.md), or `reject` (stays in this phase, artifact revised). Always
   log it: `plumb log gate --id <id> --phase <phase> --result <result>
   [--reason "..."]`.

## Board and PR writes

Before writing a comment to the board or opening a PR, show the exact text
and the exact destination first. This is a separate confirmation from the
phase gate above, even if it happens right after a `pass`. The
`gate-guard` hook (where installed) blocks `git push`/`gh pr create`
without an approved `review` gate already in the journal — logging the
gate isn't optional bookkeeping, it's what unblocks the push.

## Rejections feed the dream cycle

Every `reject`, with its reason in `--reason`, is what the dream cycle
reads to find checklist gaps — don't skip logging one because the fix was
quick.
