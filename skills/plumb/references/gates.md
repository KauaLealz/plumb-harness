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
   state.md), or `reject` (stays in this phase, artifact revised).

## Board and PR writes

Before writing a comment to the board or opening a PR, show the exact text
and the exact destination first. This is a separate confirmation from the
phase gate above, even if it happens right after a `pass`.

## Rejections feed the dream cycle

Every `reject`, with its reason, goes to the journal
(`plumb log reject --phase <phase> --reason "..."`, once the journal command
exists). The dream cycle reads these to find checklist gaps — don't skip
logging a rejection because the fix was quick.
