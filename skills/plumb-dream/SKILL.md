---
name: plumb-dream
description: Runs Plumb's self-improvement cycle — turns journal evidence
  into a small set of approved overlay/fact changes. Suggested by the `plumb`
  orchestrator every N deliveries (`plumb dream-due`), or run on request. Can
  run scheduled in non-interactive mode, generating only the proposal.
---

# plumb-dream

Improves the harness from its own evidence, never from opinion. Fixed
limits, spelled out once so nothing later in this skill needs to repeat
them: **only edits `.plumb/overlay/*` and AGENTS.md's project facts, never
loosens security or LGPD rules, never removes a gate.**

## Procedure

1. `plumb log dream-start`, then `plumb dream evidence` — writes `.plumb/dream/evidence.md`: journal
   stats, inbox, rejections, review findings, verify gaps, waivers, escaped
   defects. Read it once; this step is deterministic, don't re-derive it by
   hand.
2. Memory pass: `plumb mem conflicts` lists unresolved contradictions —
   walk through them with the human (`memanto conflicts`, interactive).
   `plumb mem expiring` previews what the configured retention policy would
   expire — confirm before it actually runs. A learning that shows up
   repeatedly in the evidence is a candidate to become an `instruction`
   instead (stronger, less likely to be pruned).
3. Changes-in-test review — see `references/experiments.md`: for anything
   currently marked as an experiment, compare its target metric before and
   after, and decide keep / revert / extend.
4. Diagnosis — see `references/diagnosis.md`: turn each recurring problem
   into the cheapest fix that actually addresses it (a checklist item, a
   test rule, a sizing threshold, a map entry, a project fact, a pinned
   command or version). Don't propose a big restructuring for a problem a
   one-line checklist item fixes.
5. Proposal — at most 5 changes, each with: the evidence it's based on, the
   diff, the metric it targets, and the risk. A change that would help
   every Plumb project, not just this one, gets flagged as a candidate
   contribution to plumb-harness itself instead of a local overlay edit.
6. Present the proposal for approval — one at a time, or batched if
   `PLUMB_GATE_MODE=batch`. No change applies without an explicit yes.

## Applying an approved change

1. Dedicated branch (`dream/<slug>`), not the delivery branch.
2. Apply the edit, commit.
3. Record it as a change-in-test (see `references/experiments.md`) unless
   it's low-risk enough to apply directly (e.g. fixing a stale fact).
4. `plumb mem export` — refresh `.plumb/memory/` so the next `plumb setup`
   picks up what changed.
5. `plumb log dream-end` (paired with a `dream-start` logged at step 1 of
   this skill) — this is what resets the delivery counter `plumb dream-due`
   watches.

## Non-interactive / scheduled runs

Generate the proposal (steps 1–5) and stop there — never apply a change
without a human present. Write the proposal to
`.plumb/dream/proposals/<date>.md` for review at the next session.
