import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readConfigValue } from "./config.js";
import { recall, isBackendAvailable, backendUnavailableMessage, type MemoryType } from "./memory/index.js";

export type Phase = "ready" | "specify" | "plan" | "tasks" | "implement" | "verify" | "review";

// Which memory types are useful to read at the start of each phase (plan §13).
export const PHASE_TYPES: Record<Phase, MemoryType[]> = {
  ready: ["decision", "instruction", "fact"],
  specify: ["decision", "instruction", "fact"],
  plan: ["decision", "instruction", "learning", "artifact"],
  tasks: ["decision", "instruction", "learning", "artifact"],
  implement: ["instruction", "error", "learning"],
  verify: ["instruction", "error", "learning"],
  review: ["instruction", "decision", "error"],
};

export interface BriefResult {
  ok: boolean;
  briefPath?: string;
  message?: string;
}

export function buildBrief(cwd: string, id: string, phase: Phase): BriefResult {
  if (!isBackendAvailable(cwd)) {
    return { ok: false, message: backendUnavailableMessage(cwd) };
  }

  const maxLines = Number(readConfigValue(cwd, "PLUMB_BRIEF_MAX_LINES") ?? "60");
  const types = PHASE_TYPES[phase];
  const sections: string[] = [`# Brief — ${id} (${phase})`, ""];

  for (const type of types) {
    const result = recall(cwd, "", { type, recent: true, limit: 10 });
    if (!result.ok) continue;
    const body = result.stdout.trim();
    if (!body) continue;
    sections.push(`## ${type}`, body, "");
  }

  let lines = sections.join("\n").split("\n");
  const truncated = lines.length > maxLines;
  if (truncated) {
    lines = [...lines.slice(0, maxLines), "", `(truncated at ${maxLines} lines — PLUMB_BRIEF_MAX_LINES)`];
  }

  const workDir = join(cwd, ".plumb", "work", id);
  mkdirSync(workDir, { recursive: true });
  const briefPath = join(workDir, "brief.md");
  writeFileSync(briefPath, `${lines.join("\n")}\n`);

  return { ok: true, briefPath };
}
