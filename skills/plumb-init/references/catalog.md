# Connector catalog

## Core — no signal needed, always on

The `secrets` MCP is not a suggestion: every project gets it, because
`plumb setup` and `verify` need somewhere to put local secrets that isn't
`.plumb/config.env` or a paste into the conversation. Confirm it's
connected during the "Harness" round (§interview.md) instead of asking
whether to add it — the question is "is it configured", not "do you want
it".

## Conditional — suggested only when a signal matches

Suggest, never install without a yes. Match signals the discovery step
already found — don't ask "do you use Jira?" when the branch names already
answer it.

| Sinal detectado | Sugestão |
|---|---|
| Remote do GitHub | CLI `gh` |
| IDs como ABC-123 em branches e commits | Atlassian (Jira e Confluence) |
| Padrão de IDs do Linear | Linear |
| SDK do Sentry nas dependências | Sentry (com Seer para causa raiz) |
| Snyk na CI | Snyk |
| Pagamento, autenticação ou dados regulados; Semgrep na CI | Semgrep |
| Dockerfile, IaC ou Trivy na CI | Trivy |
| Supabase, Vercel ou AWS configurados | Conector oficial da plataforma |
| Design no Figma citado na entrevista | Figma |

Each accepted suggestion gets recorded (which signal triggered it) so a
later `plumb doctor --agents` or a dream cycle can tell a deliberate choice
from a stale one.
