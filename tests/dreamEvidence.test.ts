import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildEvidence } from "../src/lib/dreamEvidence.js";
import { appendJournalEvent } from "../src/lib/journal.js";

describe("buildEvidence", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-dream-evidence-"));
    mkdirSync(join(dir, ".plumb", "dream"), { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reports 'None.' sections and empty inbox for a clean project", () => {
    const evidence = buildEvidence(dir);
    expect(evidence).toContain("## Rejections\n\nNone.");
    expect(evidence).toContain("## Inbox\n\nNone.");
  });

  it("includes the inbox content and journal-derived sections", () => {
    writeFileSync(join(dir, ".plumb", "dream", "inbox.md"), "Consider adding a timeout checklist item.");
    appendJournalEvent(dir, { event: "gate", id: "PAY-142", phase: "ready", result: "reject", reason: "missing timeout" });
    appendJournalEvent(dir, { event: "verify-gap", id: "PAY-142", detail: "negative amount returns 500" });

    const evidence = buildEvidence(dir);
    expect(evidence).toContain("Consider adding a timeout checklist item.");
    expect(evidence).toContain("[PAY-142] ready: missing timeout");
    expect(evidence).toContain("[PAY-142] negative amount returns 500");
  });
});
