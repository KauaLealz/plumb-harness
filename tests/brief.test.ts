import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("../src/lib/memory/index.js", () => ({
  recall: vi.fn(() => ({ ok: true, stdout: "- Auth uses JWT now (decision, 2026-09-01)", stderr: "" })),
  isBackendAvailable: vi.fn((cwd: string) => readFileSync(join(cwd, ".plumb", "config.env"), "utf8").includes("PLUMB_MEMANTO_AGENT=my-project")),
  backendUnavailableMessage: vi.fn(() => "No memory backend configured."),
}));

describe("buildBrief", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-brief-"));
    mkdirSync(join(dir, ".plumb"), { recursive: true });
    writeFileSync(
      join(dir, ".plumb", "config.env"),
      "PLUMB_MEMANTO_AGENT=my-project\nPLUMB_BRIEF_MAX_LINES=60\n",
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("writes brief.md with a section per phase-relevant type", async () => {
    const { buildBrief } = await import("../src/lib/brief.js");
    const result = buildBrief(dir, "PAY-142", "plan");

    expect(result.ok).toBe(true);
    const content = readFileSync(result.briefPath!, "utf8");
    expect(content).toContain("# Brief — PAY-142 (plan)");
    expect(content).toContain("## decision");
    expect(content).toContain("## learning");
    expect(content).toContain("## artifact");
    expect(content).not.toContain("## error"); // not a plan-phase type
  });

  it("fails clearly when no memory backend is configured", async () => {
    writeFileSync(join(dir, ".plumb", "config.env"), "PLUMB_MEMANTO_AGENT=\n");
    const { buildBrief } = await import("../src/lib/brief.js");
    const result = buildBrief(dir, "PAY-142", "ready");

    expect(result.ok).toBe(false);
    expect(existsSync(join(dir, ".plumb", "work", "PAY-142", "brief.md"))).toBe(false);
  });
});
