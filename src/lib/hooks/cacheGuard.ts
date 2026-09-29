// Blocks edits to what must stay stable within a session for prompt
// caching to work (plan §14): AGENTS.md's managed block, skills, overlay.
const PROTECTED_PATTERNS = [/(^|\/)AGENTS\.md$/, /(^|\/)skills\//, /\.plumb\/overlay\//];

export function isProtectedPath(filePath: string): boolean {
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(filePath));
}

export const CACHE_GUARD_MESSAGE =
  "Blocked: editing AGENTS.md, skills/, or .plumb/overlay/ mid-session breaks prompt caching. " +
  "Write the idea to .plumb/dream/inbox.md instead — the dream cycle applies harness changes in batch, between sessions.";
