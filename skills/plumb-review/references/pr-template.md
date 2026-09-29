# PR draft template

```
## Summary
<1-3 bullets — what changed and why, from spec.md's Objetivo>

## Acceptance criteria
| AC | Prova |
|---|---|
| AC-1 | <TS-n / resultado> |

## Diagram
<link, se plan gerou um; omitir a seção se não houver>

## Test plan
<comandos usados em verify.md, resumidos>
```

Keep the description grounded in what `verify.md` actually proved — don't
restate the spec's aspirations as if they were the PR's claims. A reviewer
reading this should be able to tell exactly what was checked and how.
