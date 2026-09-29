import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractProjectFacts, upsertPlumbBlock } from "./agentsBlock.js";

export const AGENTS_MD = "AGENTS.md";
export const BRIDGE_FILES = ["CLAUDE.md", "GEMINI.md"] as const;

export interface ApplyAgentsFileResult {
  agentsPath: string;
  wasCreated: boolean;
  bridgesCreated: string[];
}

/**
 * Writes/updates the managed Plumb block in AGENTS.md and creates the
 * `@AGENTS.md` bridge files for tools that don't read AGENTS.md natively,
 * but only when those files don't already exist (never overwrite content
 * a project already had).
 */
export function applyAgentsFile(cwd: string): ApplyAgentsFileResult {
  const agentsPath = join(cwd, AGENTS_MD);
  const existingContent = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "";
  const wasCreated = !existsSync(agentsPath);

  const facts = extractProjectFacts(existingContent);
  writeFileSync(agentsPath, upsertPlumbBlock(existingContent, facts));

  const bridgesCreated: string[] = [];
  for (const bridge of BRIDGE_FILES) {
    const bridgePath = join(cwd, bridge);
    if (!existsSync(bridgePath)) {
      writeFileSync(bridgePath, "@AGENTS.md\n");
      bridgesCreated.push(bridge);
    }
  }

  return { agentsPath, wasCreated, bridgesCreated };
}
