# Sizing

Limits for each size and the trigger for re-sizing (scope growth > 50%
during a phase re-triggers this table). Defaults below match the plan;
adjust per project via `plumb-init` or an approved dream cycle.

| Tamanho | Sinais | Como o fluxo se ajusta |
|---|---|---|
| quick | Até 3 arquivos, sem novo contrato | ready e verify leves, sem specify e plan completos, um único gate |
| small | 1 módulo, critérios claros | Plano e tasks embutidos na spec |
| medium | Vários módulos ou front e back | Fluxo completo |
| large | Nova capacidade ou migração | Completo, com riscos, diagrama e revisores extras |
| complex | Arquitetura, segurança ou dados | Completo, com alternativas de design e gate por lote de tasks |
