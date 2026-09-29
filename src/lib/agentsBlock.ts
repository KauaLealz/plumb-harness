const BEGIN_MARKER = "<!-- plumb:begin (managed; changed only via plumb-init or an approved dream) -->";
const END_MARKER = "<!-- plumb:end -->";

export function renderPlumbBlock(projectFacts: string): string {
  const facts = projectFacts.trim().length > 0
    ? projectFacts.trim()
    : "(run the `plumb-init` skill to fill this in)";

  return `${BEGIN_MARKER}
# Plumb
Spec-driven harness. Use skill \`plumb\` for any code change; plain questions don't need it.

## Always
- Answer in caveman mode (level in .plumb/config.env). Code, commands, paths, errors: exact.
- Evidence over opinion: cite card, human decision, memory, doc or file:line.
- Never advance a phase, write to the board, push or open a PR without an explicit human "yes".
- Never touch production systems or print, inline, or commit a secret value.

## Tools
- Code: Serena symbol tools first; read whole files only when symbols are not enough.
- External libraries: Context7 (\`ctx7\`) before relying on memory.
- Data: Nautilus, local connections only, read-only.
- Browser: \`playwright-cli\`. Shell output is compressed by RTK; read full logs only for the failing part.
- Secrets: the \`secrets\` MCP (core, always installed) is the only way in or
  out — \`create_secret\`/\`create_secrets_batch\` to store, then
  \`apply_secrets_to_file\`/\`run_with_secret\` to consume without the value
  ever entering context. Never a config.env line, never a paste.

## Memory & cache
- Phase start: \`plumb brief <id> <phase>\`, read brief.md once. Gaps: \`plumb mem recall\`.
- Store only durable facts: \`plumb mem remember "<fact>" --type decision|instruction|learning|error\`.
- During a session never edit this file, skills or .plumb/overlay; write ideas to .plumb/dream/inbox.md.
- Never switch model or toggle MCP servers mid-session; escalate via subagent or new session.
- Same failure twice: stop, write handoff.md, recommend a fresh session.

## Project facts
${facts}
${END_MARKER}`;
}

/**
 * Pulls the current "Project facts" section out of an existing managed
 * block, so a `doctor --fix` re-render never clobbers facts the
 * `plumb-init` interview (or an approved dream) already wrote.
 */
export function extractProjectFacts(existingContent: string): string {
  const beginIndex = existingContent.indexOf(BEGIN_MARKER);
  const endIndex = existingContent.indexOf(END_MARKER);
  if (beginIndex === -1 || endIndex === -1) return "";

  const block = existingContent.slice(beginIndex, endIndex);
  const factsIndex = block.indexOf("## Project facts");
  if (factsIndex === -1) return "";

  const facts = block.slice(factsIndex + "## Project facts".length).trim();
  return facts === "(run the `plumb-init` skill to fill this in)" ? "" : facts;
}

/**
 * Inserts or replaces the managed Plumb block inside AGENTS.md content.
 * Preserves everything else in the file untouched.
 */
export function upsertPlumbBlock(existingContent: string, projectFacts: string): string {
  const block = renderPlumbBlock(projectFacts);
  const beginIndex = existingContent.indexOf(BEGIN_MARKER);
  const endIndex = existingContent.indexOf(END_MARKER);

  if (beginIndex !== -1 && endIndex !== -1) {
    const before = existingContent.slice(0, beginIndex);
    const after = existingContent.slice(endIndex + END_MARKER.length);
    return `${before}${block}${after}`;
  }

  const trimmed = existingContent.trimEnd();
  return trimmed.length > 0 ? `${trimmed}\n\n${block}\n` : `${block}\n`;
}
