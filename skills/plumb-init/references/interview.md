# Interview rounds

Five rounds, in order. Skip a round entirely if a preset already answered
it. Within a round, ask only what discovery left unknown — up to 6
questions, each with a suggested answer.

| Rodada | Assuntos |
|---|---|
| Produto e domínio | O que o sistema faz, usuários, fluxos críticos, glossário, dados regulados |
| Fluxo do time | Board e acesso, formato de ID, aprovações, branch, commit e PR, ambientes, onde estão os documentos |
| Qualidade | Definição de ready e de done, regras de review, lint e formatação |
| Testes | Frameworks, como subir o ambiente, URL da aplicação, OpenAPI, serviços externos e troca de URL, auditoria, massa de dados, cobertura, CI |
| Harness | Modo dos gates, autonomia no board, nível do Caveman, tiers de modelo, áreas proibidas, diagramas, conectores sugeridos |

## Writing a good suggested answer

Same bar as `plumb-ready`'s evidence rule: the suggestion should be
something the human can just confirm, not a restatement of the question.
"What's the branch pattern?" is weak. "What's the branch pattern? Looks
like `feat/<ticket>-description` from the last 10 merged branches —
confirm?" is strong, and it came from actually looking at `git log`, not
from a generic default.

## Fluxos críticos

The "Produto e domínio" round's critical-flows answer feeds directly into
`.plumb/overlay/testing.md` — it decides which contexts get journey-level
minimums instead of component-level ones. Don't treat it as throwaway
context; write it into the overlay file, not just the conversation.
