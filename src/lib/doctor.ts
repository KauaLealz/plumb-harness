import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readPlumbLock } from "./plumbDir.js";

export interface DoctorIssue {
  code: string;
  message: string;
}

const REQUIRED_PATHS = [
  "config.env",
  "map.md",
  join("overlay", "ready.md"),
  join("overlay", "sizing.md"),
  join("overlay", "testing.md"),
  join("overlay", "review.md"),
  join("templates", "state.md"),
  join("templates", "spec.md"),
  "work",
  "e2e",
  "mocks",
  "memory",
  "journal.jsonl",
  join("dream", "inbox.md"),
];

export function checkPlumbDir(cwd: string): DoctorIssue[] {
  const issues: DoctorIssue[] = [];
  const plumbDir = join(cwd, ".plumb");

  if (!existsSync(plumbDir)) {
    return [{ code: "missing-plumb-dir", message: "No .plumb/ found. Run `plumb init`." }];
  }

  for (const relative of REQUIRED_PATHS) {
    if (!existsSync(join(plumbDir, relative))) {
      issues.push({ code: "missing-path", message: `.plumb/${relative} is missing.` });
    }
  }

  const lock = readPlumbLock(cwd);
  if (!lock) {
    issues.push({ code: "missing-lock", message: "plumb.lock is missing or invalid JSON." });
  }

  const agentsPath = join(cwd, "AGENTS.md");
  if (!existsSync(agentsPath)) {
    issues.push({ code: "missing-agents-md", message: "AGENTS.md is missing." });
  } else {
    const content = readFileSync(agentsPath, "utf8");
    if (!content.includes("<!-- plumb:begin") || !content.includes("<!-- plumb:end -->")) {
      issues.push({ code: "missing-managed-block", message: "AGENTS.md has no Plumb managed block." });
    }
  }

  return issues;
}
