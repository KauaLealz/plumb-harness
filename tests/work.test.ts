import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWork, listWork } from "../src/lib/work.js";

describe("createWork / listWork", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-work-"));
    mkdirSync(join(dir, ".plumb"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates a work dir with an evidence/ subdir and a state.md starting at ready/unsized", () => {
    const workDir = createWork(dir, "PAY-142");
    expect(existsSync(join(workDir, "evidence"))).toBe(true);
    expect(existsSync(join(workDir, "state.md"))).toBe(true);
    expect(listWork(dir)).toEqual([{ id: "PAY-142", phase: "ready", size: "unsized" }]);
  });

  it("refuses to overwrite an existing work item", () => {
    createWork(dir, "PAY-142");
    expect(() => createWork(dir, "PAY-142")).toThrow(/already exists/);
  });

  it("returns an empty list when there is no work yet", () => {
    expect(listWork(dir)).toEqual([]);
  });
});
