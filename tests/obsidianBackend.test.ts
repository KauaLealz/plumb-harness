import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isObsidianAvailable, rememberObsidian, recallObsidian, exportObsidian } from "../src/lib/memory/obsidianBackend.js";

describe("obsidianBackend", () => {
  let projectDir: string;
  let vaultDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), "plumb-obsidian-project-"));
    vaultDir = mkdtempSync(join(tmpdir(), "plumb-obsidian-vault-"));
    mkdirSync(join(projectDir, ".plumb"));
    writeFileSync(
      join(projectDir, ".plumb", "config.env"),
      `PLUMB_MEMANTO_AGENT=my-project\nPLUMB_OBSIDIAN_VAULT_PATH=${vaultDir}\n`,
    );
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
    rmSync(vaultDir, { recursive: true, force: true });
  });

  it("is unavailable when the vault path is unset or missing", () => {
    const noVault = mkdtempSync(join(tmpdir(), "plumb-obsidian-empty-"));
    mkdirSync(join(noVault, ".plumb"));
    writeFileSync(join(noVault, ".plumb", "config.env"), "PLUMB_OBSIDIAN_VAULT_PATH=\n");
    try {
      expect(isObsidianAvailable(noVault)).toBe(false);
    } finally {
      rmSync(noVault, { recursive: true, force: true });
    }
  });

  it("is available once the vault path exists", () => {
    expect(isObsidianAvailable(projectDir)).toBe(true);
  });

  it("writes a note with frontmatter under Plumb/<namespace>/memories/<type>/", () => {
    const result = rememberObsidian(projectDir, "Auth uses JWT now", { type: "decision" });
    expect(result.ok).toBe(true);

    const dir = join(vaultDir, "Plumb", "my-project", "memories", "decision");
    expect(existsSync(dir)).toBe(true);
  });

  it("recalls what was remembered, filtered by type and query", () => {
    rememberObsidian(projectDir, "Auth uses JWT now", { type: "decision" });
    rememberObsidian(projectDir, "Payment webhook retries 3x", { type: "learning" });

    const decisions = recallObsidian(projectDir, "", { type: "decision", recent: true });
    expect(decisions.stdout).toContain("Auth uses JWT now");
    expect(decisions.stdout).not.toContain("Payment webhook");

    const matched = recallObsidian(projectDir, "webhook", {});
    expect(matched.stdout).toContain("Payment webhook retries 3x");
  });

  it("recall reports no matches without erroring", () => {
    const result = recallObsidian(projectDir, "nothing here", {});
    expect(result.ok).toBe(true);
    expect(result.stdout).toMatch(/no memories/i);
  });

  it("export points at the memories dir once something was remembered", () => {
    rememberObsidian(projectDir, "Auth uses JWT now", { type: "decision" });
    const result = exportObsidian(projectDir);
    expect(result.ok).toBe(true);
    expect(result.bundlePath).toContain("memories");
  });
});
