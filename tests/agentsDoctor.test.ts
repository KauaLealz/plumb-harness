import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkClaudeCode, checkCursor } from "../src/lib/agentsDoctor.js";
import { installSkillsForClaudeCode } from "../src/lib/skillsInstall.js";
import { installHooks } from "../src/lib/hooksInstall.js";
import { applyAgentsFile } from "../src/lib/agentsFile.js";

describe("checkClaudeCode", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-agents-doctor-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reports everything missing on a bare directory", () => {
    const report = checkClaudeCode(dir);
    expect(report.checks.every((c) => !c.ok)).toBe(true);
  });

  it("reports everything ok after a full install", () => {
    applyAgentsFile(dir);
    installSkillsForClaudeCode(dir);
    installHooks(dir);

    const report = checkClaudeCode(dir);
    expect(report.checks.every((c) => c.ok)).toBe(true);
  });
});

describe("checkCursor", () => {
  it("is honest that skills/hooks aren't automated yet", () => {
    const dir = mkdtempSync(join(tmpdir(), "plumb-agents-doctor-cursor-"));
    try {
      const report = checkCursor(dir);
      const skillsCheck = report.checks.find((c) => c.name === "skills installed");
      expect(skillsCheck?.ok).toBe(false);
      expect(skillsCheck?.detail).toMatch(/not automated/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
