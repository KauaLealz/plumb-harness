import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TEMPLATES_ROOT } from "./plumbDir.js";

export interface WorkSummary {
  id: string;
  phase: string | null;
  size: string | null;
}

function parseStateField(content: string, label: string): string | null {
  const match = content.match(new RegExp(`^- ${label}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

export function createWork(cwd: string, id: string): string {
  const workDir = join(cwd, ".plumb", "work", id);
  if (existsSync(workDir)) {
    throw new Error(`.plumb/work/${id} already exists`);
  }

  mkdirSync(workDir, { recursive: true });
  mkdirSync(join(workDir, "evidence"), { recursive: true });

  const template = readFileSync(join(TEMPLATES_ROOT, "artifacts", "state.md"), "utf8");
  const stateMd = template
    .replace("# State — <id>", `# State — ${id}`)
    .replace(/^- Tamanho:.*$/m, "- Tamanho: unsized")
    .replace(/^- Fase atual:.*$/m, "- Fase atual: ready");

  writeFileSync(join(workDir, "state.md"), stateMd);
  return workDir;
}

export function listWork(cwd: string): WorkSummary[] {
  const workRoot = join(cwd, ".plumb", "work");
  if (!existsSync(workRoot)) return [];

  return readdirSync(workRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const statePath = join(workRoot, entry.name, "state.md");
      if (!existsSync(statePath)) {
        return { id: entry.name, phase: null, size: null };
      }
      const content = readFileSync(statePath, "utf8");
      return {
        id: entry.name,
        phase: parseStateField(content, "Fase atual"),
        size: parseStateField(content, "Tamanho"),
      };
    });
}
