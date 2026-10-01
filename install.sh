#!/usr/bin/env bash
# Instala o Plumb para o Claude Code, o Cursor ou os dois.
#   ./install.sh                  # Claude Code, global (~/.claude)
#   ./install.sh cursor           # Cursor, global (~/.cursor)
#   ./install.sh both             # os dois
#   ./install.sh both --project   # só no projeto atual (.claude/ e .cursor/)
set -euo pipefail
target="${1:-claude}"
case "$target" in claude|cursor|both) ;; *) echo "uso: $0 [claude|cursor|both] [--project]" >&2; exit 1 ;; esac
src="$(cd "$(dirname "$0")" && pwd)"
base="$HOME"; [ "${2:-}" = "--project" ] && base="$PWD"

copy_skills() {
  mkdir -p "$1"
  for d in "$src"/skills/*/; do
    name="$(basename "$d")"; rm -rf "${1:?}/$name"; cp -R "$d" "$1/$name"
  done
  echo "skills  -> $1"
}

copy_agents() {  # $1 = destino, $2 = "cursor" para gerar a variante do Cursor
  mkdir -p "$1"
  for f in "$src"/agents/*.md; do
    if [ "${2:-}" = "cursor" ]; then
      # O Cursor não documenta aliases de modelo nem effort/disallowedTools;
      # readonly: true (já no arquivo) é o que restringe os agentes de leitura.
      sed -e 's/^model: [a-z]*$/model: inherit/' -e '/^effort: /d' -e '/^disallowedTools: /d' "$f" > "$1/$(basename "$f")"
    else
      cp "$f" "$1/"
    fi
  done
  echo "agents  -> $1"
}

if [ "$target" = claude ] || [ "$target" = both ]; then
  copy_skills "$base/.claude/skills"; copy_agents "$base/.claude/agents"
fi
set_global_instruction() {  # bloco entre marcadores: substitui e preserva o resto
  file="$1"; mkdir -p "$(dirname "$file")"; touch "$file"
  awk -v blockfile="$src/global-instruction.md" '
    BEGIN { while ((getline l < blockfile) > 0) block = block l ORS }
    /<!-- plumb:start -->/ { printf "%s", block; skip = 1; done = 1; next }
    /<!-- plumb:end -->/   { skip = 0; next }
    !skip { print }
    END { if (!done) { if (NR > 0) print ""; printf "%s", block } }
  ' "$file" > "$file.tmp"
  cat "$file.tmp" > "$file"; rm -f "$file.tmp"  # sem rename: alguns ambientes Windows falham em mv
  echo "instrução global -> $file"
}

if { [ "$target" = claude ] || [ "$target" = both ]; } && [ "$base" = "$HOME" ]; then
  set_global_instruction "$HOME/.claude/CLAUDE.md"
fi
if [ "$target" = cursor ] || [ "$target" = both ]; then
  # O Cursor também lê .claude/skills: com 'both', as skills não são duplicadas.
  [ "$target" = cursor ] && copy_skills "$base/.cursor/skills"
  copy_agents "$base/.cursor/agents" cursor
fi
if { [ "$target" = cursor ] || [ "$target" = both ]; } && [ "$base" = "$HOME" ]; then
  echo "Cursor: cole o conteúdo de global-instruction.md em Settings > Rules > User Rules."
fi
echo "Pronto. Em cada repositório, rode /plumb-setup."
