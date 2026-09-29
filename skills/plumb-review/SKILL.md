---
name: plumb-review
description: Runs the `review` phase of the Plumb flow — checks the diff
  against the spec and project rules, and drafts the PR. Called by the
  `plumb` orchestrator skill; never invoked directly from a user request.
---

# plumb-review

Answers: does the code meet the spec and the project's rules? Produces
`review.md` in `.plumb/work/<id>/`, using `.plumb/templates/review.md`.

## Procedure

1. Diff against `spec.md`: every REQ implemented or explicitly deferred
   with a reason; every AC has a passing proof in `verify.md`.
2. Apply `.plumb/overlay/review.md`'s checklist (quality, conventions,
   security).
3. `large`/`complex` or any risk context (auth, pagamento, dados pessoais):
   dispatch `reviewer-security` and `reviewer-domain` subagents
   (`plumb/references/agents/`); performance context: also
   `reviewer-performance`. Merge their one-line findings into `review.md`,
   ranked by severity.
4. Run the ecosystem dependency audit if a dependency changed; run Semgrep
   if the project has it configured for this risk context.
5. Draft the PR — title, description with the AC matrix from `verify.md`,
   and a link to the diagram if `plan` produced one. See
   `references/pr-template.md`.

## Gate

Present `review.md` and the PR draft, summarize findings by severity, ask
about anything not auto-resolved. On `pass`, show the exact PR title/body
and destination, then open it only after that separate confirmation
(`plumb/references/gates.md`) — review passing is not the same approval as
opening the PR.

Every rejected/blocker finding here that traces back to a gap earlier in
the flow (a missed REQ, a test that should've caught it) is worth a journal
entry — the dream cycle uses these to improve the checklists that let it
through.
