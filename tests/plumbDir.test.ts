import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scaffoldPlumbDir, writePlumbLock, readPlumbLock } from "../src/lib/plumbDir.js";

describe("scaffoldPlumbDir", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-scaffold-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates every required file and directory", () => {
    const result = scaffoldPlumbDir(dir);

    expect(existsSync(join(dir, ".plumb", "config.env"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "map.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "overlay", "ready.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "overlay", "sizing.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "overlay", "testing.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "overlay", "review.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "templates", "state.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "templates", "spec.md"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "work"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "e2e"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "mocks"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "memory"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "journal.jsonl"))).toBe(true);
    expect(existsSync(join(dir, ".plumb", "dream", "inbox.md"))).toBe(true);
    expect(result.skipped).toHaveLength(0);
  });

  it("never overwrites an existing file unless force is set", () => {
    scaffoldPlumbDir(dir);
    writeFileSync(join(dir, ".plumb", "config.env"), "PLUMB_CUSTOM=1\n");

    const second = scaffoldPlumbDir(dir);
    const content = readFileSync(join(dir, ".plumb", "config.env"), "utf8");

    expect(content).toBe("PLUMB_CUSTOM=1\n");
    expect(second.skipped.length).toBeGreaterThan(0);
  });
});

describe("plumb.lock", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-lock-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("round-trips version through write and read", () => {
    writePlumbLock(dir, "0.1.0");
    expect(readPlumbLock(dir)?.plumbVersion).toBe("0.1.0");
  });

  it("returns null when the lock file doesn't exist", () => {
    expect(readPlumbLock(dir)).toBeNull();
  });
});
