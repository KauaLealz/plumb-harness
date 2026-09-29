const STATE_MD_PATTERN = /\.plumb[/\\]work[/\\]([^/\\]+)[/\\]state\.md$/;

export function workIdFromStateMdPath(filePath: string): string | null {
  const match = filePath.match(STATE_MD_PATTERN);
  return match ? match[1] : null;
}

export function parsePhase(stateMdContent: string): string | null {
  const match = stateMdContent.match(/^- Fase atual:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}
