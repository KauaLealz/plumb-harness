# Eval run log

Real runs (`claude -p ... --permission-mode bypassPermissions`) against
`tests/fixtures/example-api`, Claude Code only, skills copied into
`.claude/skills/`. Not simulated — actual subprocess output.

## O1 — repo without `.plumb/` offers to set it up

**Result: pass.** Prompt `"implementa o PAY-142"` against a repo with no
`.plumb/`. Response: noticed no `.plumb/` and no `plumb` CLI on PATH,
proposed running `plumb-init` before doing any work, and asked whether
PAY-142 might actually belong to a different project instead of guessing.

## O2 — quick-sized task still gets a work item

**Result: pass, after two fixes found live.** Prompt: fix a one-word typo
in a comment.

- First run: fixed the typo directly, no work item, no gate, no journal
  entry at all — the orchestrator skill had no explicit floor stopping it
  from treating a trivial change as "too small for the ritual."
- Fix: added an explicit floor to `skills/plumb/SKILL.md` — `quick` gets a
  work item and a logged gate too, no exceptions for size.
- Second run: surfaced a real environment gap instead of silently
  complying — `plumb` wasn't actually linked globally (`npm link` had
  never been run), so it correctly stopped and asked rather than fake a
  work item it couldn't back with the CLI.
- Fix: `npm link` in plumb-harness, so `plumb` resolves like it would after
  a real `install.sh` run.
- Third run: created `.plumb/work/typo-recieved-server-js/` sized `quick`,
  wrote `state.md` with the decision, and — without being asked — the
  `journal-phase` hook (Fase 5) fired for real and logged `phase-start` to
  `.plumb/journal.jsonl`. Stopped for the gate before applying the edit,
  exactly as the gate protocol requires.

This is the most useful result of the whole eval pass: not "the skill
works," but two concrete, evidence-based fixes it produced, one in the
skill's own text and one in the harness's own setup — which is the dream
cycle's job, just run manually this time instead of through
`plumb-dream`.

## Not yet run live

R1, R2, P1, P2, V1, I1 from `cases.md` are written but not yet exercised —
same reasoning gap as the "known gaps" section there: time budget for this
pass went to depth (iterate O1/O2 to a real fix) over breadth (run every
case once, shallow). Running the rest is the natural next increment.
