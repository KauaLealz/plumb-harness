# Testing

Two different things get tested here, deliberately kept separate.

## The CLI itself

Plain Vitest, in `tests/*.test.ts`, one file roughly per `src/lib/*`
module. Run with `npm test`. The bar: every `src/lib/` function with a
decision in it (parsing, filtering, matching, merging) has a direct test —
command files (`src/commands/*.ts`) stay thin enough that they mostly don't
need their own tests, since the logic they call already does.

Side-effecting code (spawns `memanto`, calls `git`, hits the filesystem)
gets a real temp directory per test (`mkdtempSync`) or `vi.mock` for the
subprocess boundary — see `tests/memanto.test.ts` for the mocking pattern
and `tests/plumbDir.test.ts` for the temp-dir pattern.

## Whether the skills actually work

This is a different question from "does the CLI have a bug," and unit
tests can't answer it — it requires a real AI tool actually reading the
skill and behaving as described. `tests/evals/` holds:

- `cases.md` — one scenario per case, with objective pass/fail criteria,
  organized by skill.
- `results.md` — a log of cases actually run, against which fixture, with
  the real transcript excerpt and outcome.
- `tests/fixtures/*` — small, purpose-built repos the cases run against.
  Not real applications — just enough surface for `plumb discover` to
  detect a real stack and for a scenario to reference a plausible change.

Running a case: install the skills into the fixture
(`plumb doctor --agents --live` does this check for you against whatever
repo you run it in), then `claude -p "<the case's prompt>"` and check the
response against the case's criteria. See `results.md` for worked
examples, including one where running a case found a real bug in a skill
and the fix that followed.

## No silent gaps

`cases.md` ends with a "Known gaps" section listing what isn't covered yet
(fixture types, tools, skills without cases). When you add coverage, trim
that section; when you notice a gap you're not fixing right now, add it
there instead of leaving it unstated.
