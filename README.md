# Plumb

Open source spec-driven development (SDD) harness for AI coding agents.

The agent drives, the harness guides, the human approves. Ask for a
change in plain language — `"implementa o PAY-142"`, `"corrige o bug de
login"` — and Plumb sizes the work, runs it through
ready→specify→plan→tasks→implement→verify→review with a human gate at
each step, and resumes cleanly across sessions instead of losing context.

Works with **Claude Code** today; **Cursor** gets the AGENTS.md
instructions layer but not yet automated skill/hook installation (see
[`docs/compatibility.md`](docs/compatibility.md) for exactly what that
means).

## Quickstart

```bash
git clone https://github.com/KauaLealz/plumb-harness.git
cd plumb-harness && npm install && npm run build && npm link

cd ~/your-project
plumb init          # discovers your stack, scaffolds .plumb/, installs
                     # skills + hooks for Claude Code, wires Memanto
```

Then, inside Claude Code, just ask for a change. The `plumb` orchestrator
skill activates on its own — you don't need to mention Plumb by name.

## What's real right now

Every command below is implemented, unit-tested, and has been run live at
least once against a real fixture — not just described. See
`tests/evals/results.md` for the transcripts.

| Area | Commands |
|---|---|
| Project setup | `discover`, `scaffold`, `init [--from <preset>]`, `setup`, `doctor [--fix] [--agents [--live]]` |
| Global install | `install --profile minimal\|standard\|full [--yes]`, `uninstall` (also `install.sh`) |
| Work items | `new <id>`, `status` |
| Memory (Memanto or an Obsidian vault — [`docs/memory.md`](docs/memory.md)) | `mem remember/recall/export`, `mem conflicts/expiring` (Memanto only), `brief <id> <phase>` |
| Presets | `preset save/list/apply` |
| Journal & metrics | `log <event>`, `stats`, `dream-due` |
| Hooks (Claude Code) | `hooks install`, `hooks cache-guard/gate-guard/journal-phase/session-start` |
| Dream cycle support | `dream evidence` |

Skills: the orchestrator (`plumb`) plus one per phase — `plumb-ready`,
`plumb-specify`, `plumb-plan`, `plumb-tasks`, `plumb-implement`,
`plumb-verify`, `plumb-review`, `plumb-init`, `plumb-dream`.

Secrets: the `secrets` MCP is a mandatory core connector — no local secret
ever goes into `.plumb/config.env` or a conversation. See
[`docs/secrets.md`](docs/secrets.md).

## What isn't built yet

Stated plainly instead of left implicit — see each doc for the reasoning,
not just the gap:

- Cursor skill/hook automation ([`docs/compatibility.md`](docs/compatibility.md)).
- Web and mobile eval fixtures — only a Node/Express API fixture exists so
  far ([`docs/testing.md`](docs/testing.md), `tests/evals/cases.md`'s
  "Known gaps").
- `plumb upgrade` isn't built. The global installer's profile checks are
  honest, not exhaustive — Serena/Context7/secrets MCP are report-only
  (detectable only from inside an agent session, not a plain subprocess).
- Serena/Context7/Nautilus/DocGen/Excalidraw/WireMock/Hurl integration:
  referenced in skills as the target tooling, not yet wired into the CLI.
- Obsidian backend's recall is substring match, not semantic — see
  [`docs/memory.md`](docs/memory.md) for the tradeoff.

## How it's built

- [`docs/architecture.md`](docs/architecture.md) — the layers (rules,
  skills, overlay, CLI, hooks) and both repo layouts.
- [`docs/cache.md`](docs/cache.md) — why rules/skills never change
  mid-session, and where dynamic state actually lives instead.
- [`docs/compatibility.md`](docs/compatibility.md) — exactly what's
  automated per tool, and why Cursor's isn't yet.
- [`docs/testing.md`](docs/testing.md) — unit tests vs. evals, and how to
  run either.
- [`docs/secrets.md`](docs/secrets.md) — the secrets flow.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — dev setup and what a PR needs.

## Development

```bash
npm install
npm run dev -- status   # runs the CLI from source via tsx, no build needed
npm run typecheck && npm run lint && npm run build && npm test
```

## License

MIT — see [LICENSE](LICENSE).
