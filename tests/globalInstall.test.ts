import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("globalInstall", () => {
  let fakeHome: string;

  beforeEach(() => {
    fakeHome = mkdtempSync(join(tmpdir(), "plumb-global-install-"));
    vi.stubEnv("HOME", fakeHome);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(fakeHome, { recursive: true, force: true });
  });

  it("detects Claude Code / Cursor presence from home dir contents", async () => {
    const { detectAITools } = await import("../src/lib/globalInstall.js");
    expect(detectAITools()).toEqual({ claudeCode: false, cursor: false });

    mkdirSync(join(fakeHome, ".claude"));
    expect(detectAITools().claudeCode).toBe(true);
  });

  it("checkProfile grows from minimal to full without dropping earlier checks", async () => {
    const { checkProfile } = await import("../src/lib/globalInstall.js");
    const minimal = checkProfile("minimal");
    const standard = checkProfile("standard");
    const full = checkProfile("full");

    expect(minimal.length).toBeLessThan(standard.length);
    expect(standard.length).toBeLessThan(full.length);
    expect(standard.map((c) => c.name)).toEqual(expect.arrayContaining(minimal.map((c) => c.name)));
  });

  it("installs skills globally and writes an uninstallable manifest", async () => {
    const { installSkillsGlobally, writeManifest, readManifest, uninstallGlobal } = await import(
      "../src/lib/globalInstall.js"
    );

    const installed = installSkillsGlobally();
    expect(installed).toContain("plumb");
    expect(existsSync(join(fakeHome, ".claude", "skills", "plumb", "SKILL.md"))).toBe(true);

    writeManifest("standard");
    expect(readManifest()?.profile).toBe("standard");

    const removed = uninstallGlobal();
    expect(removed).toContain("plumb");
    expect(existsSync(join(fakeHome, ".claude", "skills", "plumb"))).toBe(false);
    expect(readManifest()).toBeNull();
  });

  it("uninstallGlobal is a no-op without a prior install", async () => {
    const { uninstallGlobal } = await import("../src/lib/globalInstall.js");
    expect(uninstallGlobal()).toEqual([]);
  });
});
