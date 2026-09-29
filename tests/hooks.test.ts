import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isProtectedPath } from "../src/lib/hooks/cacheGuard.js";
import { isGuardedCommand, hasApprovedReviewGate } from "../src/lib/hooks/gateGuard.js";
import { workIdFromStateMdPath, parsePhase } from "../src/lib/hooks/journalPhase.js";
import { installHooks } from "../src/lib/hooksInstall.js";
import type { JournalEvent } from "../src/lib/journal.js";

describe("cacheGuard.isProtectedPath", () => {
  it.each([
    "/repo/AGENTS.md",
    "/repo/skills/plumb/SKILL.md",
    "/repo/.plumb/overlay/ready.md",
  ])("blocks %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each(["/repo/src/index.ts", "/repo/.plumb/work/PAY-142/state.md", "/repo/README.md"])(
    "allows %s",
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );
});

describe("gateGuard", () => {
  it("recognizes git push and gh pr create as guarded", () => {
    expect(isGuardedCommand("git push origin main")).toBe(true);
    expect(isGuardedCommand("gh pr create --title x")).toBe(true);
    expect(isGuardedCommand("npm test")).toBe(false);
  });

  it("requires a pass or pass-with-risks review gate, specifically", () => {
    const none: JournalEvent[] = [];
    const wrongPhase: JournalEvent[] = [{ ts: "t", event: "gate", phase: "plan", result: "pass" }];
    const rejected: JournalEvent[] = [{ ts: "t", event: "gate", phase: "review", result: "reject" }];
    const approved: JournalEvent[] = [{ ts: "t", event: "gate", phase: "review", result: "pass-with-risks" }];

    expect(hasApprovedReviewGate(none)).toBe(false);
    expect(hasApprovedReviewGate(wrongPhase)).toBe(false);
    expect(hasApprovedReviewGate(rejected)).toBe(false);
    expect(hasApprovedReviewGate(approved)).toBe(true);
  });
});

describe("journalPhase", () => {
  it("extracts the work id from a state.md path", () => {
    expect(workIdFromStateMdPath("/repo/.plumb/work/PAY-142/state.md")).toBe("PAY-142");
    expect(workIdFromStateMdPath("/repo/src/state.md")).toBeNull();
  });

  it("parses the current phase from state.md content", () => {
    expect(parsePhase("# State\n- Tamanho: unsized\n- Fase atual: plan\n")).toBe("plan");
    expect(parsePhase("no phase line here")).toBeNull();
  });
});

describe("installHooks", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-hooks-install-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("creates .claude/settings.json with all four hooks on a fresh project", () => {
    const result = installHooks(dir);
    expect(result.installed).toHaveLength(4);

    const settings = JSON.parse(readFileSync(join(dir, ".claude", "settings.json"), "utf8"));
    expect(settings.hooks.PreToolUse.length).toBeGreaterThan(0);
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe("plumb hooks session-start");
  });

  it("is idempotent and never duplicates entries", () => {
    installHooks(dir);
    const second = installHooks(dir);
    expect(second.installed).toHaveLength(0);
    expect(second.alreadyPresent).toHaveLength(4);
  });

  it("preserves settings the project already had", () => {
    mkdirSync(join(dir, ".claude"), { recursive: true });
    writeFileSync(join(dir, ".claude", "settings.json"), JSON.stringify({ permissions: { allow: ["Bash(ls:*)"] } }));

    installHooks(dir);
    const settings = JSON.parse(readFileSync(join(dir, ".claude", "settings.json"), "utf8"));
    expect(settings.permissions.allow).toEqual(["Bash(ls:*)"]);
    expect(settings.hooks.PreToolUse.length).toBeGreaterThan(0);
  });
});
