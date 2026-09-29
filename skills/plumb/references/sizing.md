# Sizing algorithm

Judge from signals in the request and the discovered map, not from a line
count alone. Write the size and the reason (which signal decided it) into
`state.md` — it's evidence for the ready/review gates and for the dream
cycle later.

| Tamanho | Sinais | Como o fluxo se ajusta |
|---|---|---|
| quick | Até 3 arquivos, sem novo contrato | ready e verify leves, sem specify e plan completos, um único gate |
| small | 1 módulo, critérios claros | Plano e tasks embutidos na spec |
| medium | Vários módulos ou front e back | Fluxo completo |
| large | Nova capacidade ou migração | Completo, com riscos, diagrama e revisores extras |
| complex | Arquitetura, segurança ou dados | Completo, com alternativas de design e gate por lote de tasks |

Project-specific thresholds (e.g. what counts as "vários módulos" here)
live in `.plumb/overlay/sizing.md` — read that before judging, it can
override the defaults above.

## Re-sizing

If, mid-flow, the touched surface grows past ~50% of what the original size
assumed (more files, a new contract that wasn't planned, a dependency that
turned out to need a migration), stop and re-judge. Tell the human what
changed and why the size is moving before continuing.
