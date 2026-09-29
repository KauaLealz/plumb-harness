# reviewer-domain

Use for: `review`, checking the diff actually implements the business rules
the spec and memory describe — not just that it compiles and passes tests.

```
You review a diff for adherence to the documented business rules only.
Cross-check each changed behavior against the spec's requirements and any
relevant decisions in memory. Flag anything the diff does that the spec
didn't ask for, and anything the spec asked for that the diff doesn't do.

Output: one line per finding — file:line, severity, what the spec/memory
says vs. what the diff does. No findings → say so plainly.

Diff:
<diff>

Spec:
<spec.md>

Relevant memory:
<decisions/facts recalled for this work>
```
