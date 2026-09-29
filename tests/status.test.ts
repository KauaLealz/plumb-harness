import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getStatus } from "../src/commands/status.js";
import { createWork } from "../src/lib/work.js";

describe("getStatus", () => {
  it("reports no .plumb/ in a fresh directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "plumb-test-"));
    try {
      expect(getStatus(dir)).toEqual({ cwd: dir, hasPlumbDir: false, work: [] });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports .plumb/ with no work items yet", () => {
    const dir = mkdtempSync(join(tmpdir(), "plumb-test-"));
    try {
      mkdirSync(join(dir, ".plumb"));
      expect(getStatus(dir)).toEqual({ cwd: dir, hasPlumbDir: true, work: [] });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("lists work items with their phase and size", () => {
    const dir = mkdtempSync(join(tmpdir(), "plumb-test-"));
    try {
      mkdirSync(join(dir, ".plumb"));
      createWork(dir, "PAY-142");
      expect(getStatus(dir).work).toEqual([
        { id: "PAY-142", phase: "ready", size: "unsized" },
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
