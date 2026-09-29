import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getStatus } from "../src/commands/status.js";

describe("getStatus", () => {
  it("reports no .plumb/ in a fresh directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "plumb-test-"));
    try {
      expect(getStatus(dir)).toEqual({ cwd: dir, hasPlumbDir: false });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports .plumb/ when it exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "plumb-test-"));
    try {
      mkdirSync(join(dir, ".plumb"));
      expect(getStatus(dir)).toEqual({ cwd: dir, hasPlumbDir: true });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
