import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("presets", () => {
  let projectDir: string;
  let presetsHome: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), "plumb-preset-project-"));
    presetsHome = mkdtempSync(join(tmpdir(), "plumb-preset-home-"));
    vi.stubEnv("HOME", presetsHome);

    mkdirSync(join(projectDir, ".plumb", "overlay"), { recursive: true });
    writeFileSync(join(projectDir, ".plumb", "overlay", "ready.md"), "custom ready checklist");
    writeFileSync(join(projectDir, ".plumb", "config.env"), "PLUMB_CAVEMAN_LEVEL=full\n");
    writeFileSync(join(projectDir, ".plumb", "map.md"), "# Map\ncustom");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(projectDir, { recursive: true, force: true });
    rmSync(presetsHome, { recursive: true, force: true });
  });

  it("saves and lists a preset", async () => {
    const { savePreset, listPresets } = await import("../src/lib/preset.js");
    savePreset(projectDir, "acme-client");
    expect(listPresets()).toEqual(["acme-client"]);
  });

  it("applies a preset onto a fresh project", async () => {
    const { savePreset, applyPreset } = await import("../src/lib/preset.js");
    savePreset(projectDir, "acme-client");

    const freshProject = mkdtempSync(join(tmpdir(), "plumb-preset-fresh-"));
    mkdirSync(join(freshProject, ".plumb"), { recursive: true });
    try {
      const result = applyPreset(freshProject, "acme-client");
      expect(result.applied).toEqual(["overlay", "config.env", "map.md"]);
      expect(readFileSync(join(freshProject, ".plumb", "overlay", "ready.md"), "utf8")).toBe(
        "custom ready checklist",
      );
      expect(existsSync(join(freshProject, ".plumb", "map.md"))).toBe(true);
    } finally {
      rmSync(freshProject, { recursive: true, force: true });
    }
  });

  it("throws a clear error for an unknown preset", async () => {
    const { applyPreset } = await import("../src/lib/preset.js");
    expect(() => applyPreset(projectDir, "does-not-exist")).toThrow(/No preset/);
  });
});
