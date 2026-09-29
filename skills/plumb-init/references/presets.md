# Presets

A preset is a previous project's answers (overlay, config.env, map.md),
reusable when a new project shares a client, stack, or conventions.

## Using one

`plumb init --from <name>` applies the preset right after scaffolding — it
overwrites the default templates with the preset's versions. The interview
still runs, but skips any round the preset already answers; only ask about
what's specific to *this* project (repo-specific facts, this project's
critical flows).

Standalone: `plumb preset apply <name>` re-applies a preset to an already
`.plumb/`-scaffolded project (e.g. after `plumb doctor --fix` recreated
defaults).

## Saving one

After a full interview, offer to save it as a preset if the human mentions
this is one of several similar projects (a client with multiple repos, a
template stack the team reuses): `plumb preset save <name>`. Named presets
live in `~/.plumb/presets/<name>/` and can be shared by committing that
directory to a team's own dotfiles repo — Plumb itself doesn't sync them.

## What a preset does not carry

Secrets, repo-specific facts (this repo's own module map, this repo's
specific board URL), and anything that's clearly one-project-only. If in
doubt whether something belongs in a preset, ask the human rather than
including it — a preset polluted with one project's specifics stops being
reusable.
