#!/usr/bin/env bash
# Plumb global installer.
#
# No sudo: installs plumb-harness's own CLI into your user npm prefix and
# copies its skills into ~/.claude/skills/. Idempotent — safe to re-run.
#
# Usage:
#   ./install.sh                 # standard profile, asks to confirm
#   ./install.sh --profile full  # full profile
#   ./install.sh --yes           # non-interactive
set -euo pipefail

PROFILE="standard"
YES_FLAG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --yes)
      YES_FLAG="--yes"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== Plumb global install =="
echo "Repo: $SCRIPT_DIR"
echo "Profile: $PROFILE"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required and wasn't found on PATH. Install Node 20+ first." >&2
  exit 1
fi
echo "  Node: $(node --version)"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required and wasn't found on PATH." >&2
  exit 1
fi
echo "  npm: $(npm --version)"

echo ""
echo "Building plumb-harness..."
(cd "$SCRIPT_DIR" && npm install --no-audit --no-fund && npm run build)

echo ""
echo "Linking the \`plumb\` command onto your PATH (npm link, no sudo)..."
(cd "$SCRIPT_DIR" && npm link)

echo ""
echo "Handing off to \`plumb install\` for skills + profile checks..."
plumb install --profile "$PROFILE" $YES_FLAG

echo ""
echo "Done. Run \`plumb doctor --agents\` inside any repo to check the wiring,"
echo "or \`plumb doctor --agents --live\` for a real Claude Code smoke test."
