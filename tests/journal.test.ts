import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendJournalEvent, readJournal } from "../src/lib/journal.js";

describe("journal", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "plumb-journal-"));
    mkdirSync(join(dir, ".plumb"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns an empty list before anything is logged", () => {
    expect(readJournal(dir)).toEqual([]);
  });

  it("appends events as JSON lines and reads them back in order", () => {
    appendJournalEvent(dir, { event: "phase-start", id: "PAY-142", phase: "ready" });
    appendJournalEvent(dir, { event: "gate", id: "PAY-142", phase: "ready", result: "pass" });

    const events = readJournal(dir);
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe("phase-start");
    expect(events[1].result).toBe("pass");
    expect(typeof events[0].ts).toBe("string");
  });
});
