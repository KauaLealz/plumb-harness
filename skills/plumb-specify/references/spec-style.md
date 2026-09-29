# Spec style

## Provable acceptance criteria

Given/When/Then should name a concrete state, action, and observable
result — something `verify` can literally check off. "The system handles
errors gracefully" is not provable. "Given a Pix payment past its 30-minute
expiry, When the webhook confirms it, Then the payment is rejected with
reason `expired`" is.

## Folded structure for `small` work

When the orchestrator folds plan+tasks into the spec, add two sections
after the acceptance criteria instead of writing separate files:

```
## Abordagem
<same content a plan.md would hold — approach, testing strategy>

## Tasks
- T-1 — <arquivos, REQ/AC, comando de verificação>
```

Everything else about the spec (REQs with sources, provable ACs, out of
scope) stays the same regardless of size.
