# Diagnosis

Match each recurring problem in the evidence to the cheapest fix that
actually addresses the root cause — not the first fix that comes to mind.

| Evidência aponta para | Correção típica |
|---|---|
| Rejeições repetidas por falta do mesmo dado (ex: timeout) | Item novo no `.plumb/overlay/ready.md` |
| Lacunas de verify no mesmo tipo de contexto | Regra nova em `.plumb/overlay/testing.md` |
| Re-sizing frequente num certo tipo de tarefa | Ajustar limite em `.plumb/overlay/sizing.md` |
| Explorer gastando muitos arquivos no mesmo lugar | Entrada nova em `.plumb/map.md` |
| Achados de review repetidos na mesma categoria | Item novo em `.plumb/overlay/review.md` |
| Comando ou versão desatualizados nos fatos do projeto | Atualizar `AGENTS.md`'s project facts |
| Defeito escapado num contexto específico | Reforçar o mínimo daquele contexto em `testing.md` |

## What counts as "recurring"

One instance is an anecdote, not evidence — look for the same root cause
across at least 2–3 events before proposing a fix. A single rejection with
an unusual reason is worth noting in the proposal as "watch this" without
spending one of the 5 proposal slots on it.

## When the fix is bigger than a checklist item

If the cheapest real fix is architectural (not a checklist/threshold/fact
edit), it's out of scope for dream's fixed limits — flag it for a human
decision outside this cycle instead of forcing it into an overlay edit
that doesn't actually fix it.
