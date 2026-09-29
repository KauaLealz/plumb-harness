import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readConfigValue, writeConfigValue } from "../src/lib/config.js";

describe("config.env read/write", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-config-"));
    mkdirSync(join(dir, ".plumb"));
    writeFileSync(join(dir, ".plumb", "config.env"), "# comment\nPLUMB_CAVEMAN_LEVEL=full\nPLUMB_MEMANTO_AGENT=\n");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads an existing value", () => {
    expect(readConfigValue(dir, "PLUMB_CAVEMAN_LEVEL")).toBe("full");
  });

  it("returns null for a key that isn't set", () => {
    expect(readConfigValue(dir, "PLUMB_DOES_NOT_EXIST")).toBeNull();
  });

  it("updates a value in place without touching other lines", () => {
    writeConfigValue(dir, "PLUMB_MEMANTO_AGENT", "my-project");
    expect(readConfigValue(dir, "PLUMB_MEMANTO_AGENT")).toBe("my-project");
    expect(readConfigValue(dir, "PLUMB_CAVEMAN_LEVEL")).toBe("full");
  });
});
