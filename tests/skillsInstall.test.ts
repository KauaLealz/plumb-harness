import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installSkillsForClaudeCode } from "../src/lib/skillsInstall.js";

describe("installSkillsForClaudeCode", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-skills-install-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("copies every plumb skill into .claude/skills/", () => {
    const installed = installSkillsForClaudeCode(dir);

    expect(installed).toContain("plumb");
    expect(installed).toContain("plumb-ready");
    expect(installed).toContain("plumb-dream");
    expect(existsSync(join(dir, ".claude", "skills", "plumb", "SKILL.md"))).toBe(true);
    expect(readdirSync(join(dir, ".claude", "skills")).length).toBe(installed.length);
  });

  it("is safe to re-run (refreshes rather than erroring)", () => {
    installSkillsForClaudeCode(dir);
    const second = installSkillsForClaudeCode(dir);
    expect(second.length).toBeGreaterThan(0);
  });
});
