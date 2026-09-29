# What counts as evidence

An `ok` status needs a source, not an assumption:
- A card field or comment — cite the field name.
- A file:line in the codebase that already implements or documents the
  answer.
- A prior human decision — cite where (memory, a linked doc, a previous
  PR).

"Seems reasonable" or "probably works like X" is not evidence — that's a
`faltando`, turned into a question.

## Writing a good suggested answer

A suggested answer should be the thing you'd actually do if the human just
said "yes, go with that" — specific enough to act on, not a restatement of
the question. Bad: "What should the timeout be?" Good: "What should the
timeout be? Suggestion: 30s, matching the gateway's own default."
