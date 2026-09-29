# Hurl scenarios

`plan.md`'s TS-n entries for integration/contract tests are natural-language
scripts (steps + expected result), not Hurl files — write the actual `.hurl`
scenario here, in `verify`, from that script.

Always include the negative cases the plan called for (invalid input, zero
or negative values, unauthorized) alongside the happy path — a TS-n entry
that only checks the happy path isn't proving the AC, it's proving the
easy 80%.

After running a scenario, cross-check the state it should have produced via
Nautilus (read-only) rather than trusting the HTTP response alone — a 200
with the wrong row written is still a bug.
