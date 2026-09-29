import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyRecursive } from "./fsUtil.js";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
// dist/lib/skillsInstall.js -> ../../skills (repo root/skills)
export const SKILLS_SOURCE_ROOT = join(MODULE_DIR, "..", "..", "skills");

/** Claude Code scans .claude/skills/<name>/SKILL.md. Cursor's equivalent
 * isn't verified yet (see plan §6.1/§12.7 notes) — not installed here. */
export function installSkillsForClaudeCode(cwd: string): string[] {
  const destRoot = join(cwd, ".claude", "skills");
  const installed: string[] = [];

  for (const entry of readdirSync(SKILLS_SOURCE_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dest = join(destRoot, entry.name);
    // Harness-owned content: always refreshed to match the installed
    // plumb-harness version, never hand-edited in a consumer project.
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    copyRecursive(join(SKILLS_SOURCE_ROOT, entry.name), dest);
    installed.push(entry.name);
  }

  return installed;
}
