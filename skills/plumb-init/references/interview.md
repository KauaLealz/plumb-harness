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
| Harness | Modo dos gates, autonomia no board, nível do Caveman, tiers de modelo, áreas proibidas, diagramas, conectores sugeridos, `secrets` MCP conectado, backend de memória |

## Writing a good suggested answer

Same bar as `plumb-ready`'s evidence rule: the suggestion should be
something the human can just confirm, not a restatement of the question.
"What's the branch pattern?" is weak. "What's the branch pattern? Looks
like `feat/<ticket>-description` from the last 10 merged branches —
confirm?" is strong, and it came from actually looking at `git log`, not
from a generic default.

## Memory backend

Two options, `.plumb/config.env`'s `PLUMB_MEMORY_BACKEND`:

- `memanto` (default) — typed memory, semantic recall, on-prem (Docker +
  Ollama) or cloud. The richer option, but on-prem means a real download
  the first time.
- `obsidian` — plain markdown notes in an existing vault
  (`PLUMB_OBSIDIAN_VAULT_PATH`), under `Plumb/<project>/memories/<type>/`.
  No download, no server — just files. Search is a plain substring match
  over note content, not semantic.

Ask which one only if discovery didn't already answer it — an
`ObsidianVault` MCP connected and a vault path visible is strong evidence
for `obsidian`; nothing detected defaults to `memanto`. Don't install
Memanto's on-prem stack speculatively if the project ends up choosing
`obsidian` — check this before `plumb init`'s Memanto setup step runs.

## Fluxos críticos

The "Produto e domínio" round's critical-flows answer feeds directly into
`.plumb/overlay/testing.md` — it decides which contexts get journey-level
minimums instead of component-level ones. Don't treat it as throwaway
context; write it into the overlay file, not just the conversation.
