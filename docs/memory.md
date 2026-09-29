# Memory backends

`plumb mem`/`plumb brief` work against either backend transparently —
`.plumb/config.env`'s `PLUMB_MEMORY_BACKEND` picks which one, and every
command's behavior is identical from the outside.

| | Memanto | Obsidian |
|---|---|---|
| Setup cost | Docker + Ollama (on-prem) or a cloud key, first-run download | None — just a folder that already exists |
| Search | Semantic (embeddings) | Substring match over note content |
| Storage | Managed by Memanto's own server | Plain markdown, one file per memory |
| Config | `PLUMB_MEMANTO_AGENT` | `PLUMB_OBSIDIAN_VAULT_PATH` |

## Why both exist

Memanto is the richer option — semantic recall, typed conflict detection,
expiry policies — and it's what the `conflicts`/`expiring` commands and the
dream cycle's memory pass are built against. But it costs a real,
multi-gigabyte first-run download for on-prem mode. A project whose owner
already keeps notes in Obsidian shouldn't have to pay that cost just to get
`plumb mem remember`/`recall` working — the Obsidian backend gives up
semantic search and conflict detection in exchange for zero setup.

## The Obsidian layout

```
<vault>/Plumb/<project>/memories/
├── decision/<id>-<slug>.md
├── instruction/<id>-<slug>.md
├── learning/<id>-<slug>.md
└── ...one folder per memory type used
```

Each note:

```markdown
---
id: 1735500000000-auth-uses-jwt-now
type: decision
created: 2026-09-29T20:10:00.000Z
source: plumb
tags: [auth]
---

Auth uses JWT now
```

Deliberately parallel to Memanto's own OKF export layout
(`memories/<type>/<slug>.md`) — not because Plumb depends on that format,
but because keeping the same shape means a project could migrate between
backends later without restructuring anything by hand.

## Why the CLI reads/writes files directly instead of using the `ObsidianVault` MCP

Same reasoning as `docs/secrets.md`: MCP tools are only reachable from
inside an agent session, not from the `plumb` CLI's own subprocess. Since
an Obsidian vault is just a folder of markdown files, the CLI backend reads
and writes them directly — no MCP round-trip needed for the deterministic
parts. The `ObsidianVault` MCP is still useful to the *agent* for richer
operations (backlinks, tag search) the CLI backend doesn't attempt.

## Switching backends on an existing project

Edit `PLUMB_MEMORY_BACKEND` in `.plumb/config.env` (and
`PLUMB_OBSIDIAN_VAULT_PATH` if switching to Obsidian) — same as any other
config change, via `plumb-init`'s partial re-run or a dream cycle. Nothing
migrates automatically; the two backends' memories are independent stores.
