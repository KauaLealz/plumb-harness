import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkPlumbDir } from "../src/lib/doctor.js";
import { scaffoldPlumbDir, writePlumbLock } from "../src/lib/plumbDir.js";
import { applyAgentsFile } from "../src/lib/agentsFile.js";

describe("checkPlumbDir", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-doctor-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reports a single issue when .plumb/ doesn't exist at all", () => {
    const issues = checkPlumbDir(dir);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("missing-plumb-dir");
  });

  it("reports no issues after a full init-equivalent setup", () => {
    scaffoldPlumbDir(dir);
    writePlumbLock(dir, "0.1.0");
    applyAgentsFile(dir);

    expect(checkPlumbDir(dir)).toEqual([]);
  });

  it("flags a missing lock file even when .plumb/ is otherwise complete", () => {
    scaffoldPlumbDir(dir);
    applyAgentsFile(dir);

    const issues = checkPlumbDir(dir);
    expect(issues.map((i) => i.code)).toContain("missing-lock");
  });
});
