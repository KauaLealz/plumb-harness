import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every event type the plan's §17 lists as journal-worthy.
export type JournalEventType =
  | "phase-start"
  | "phase-end"
  | "gate"
  | "resize"
  | "waiver"
  | "retry"
  | "breaker"
  | "review-finding"
  | "verify-gap"
  | "flaky"
  | "escaped-defect"
  | "delivery"
  | "dream-start"
  | "dream-end";

export interface JournalEvent {
  ts: string;
  event: JournalEventType;
  id?: string;
  phase?: string;
  result?: string;
  reason?: string;
  severity?: string;
  detail?: string;
  [key: string]: unknown;
}

function journalPath(cwd: string): string {
  return join(cwd, ".plumb", "journal.jsonl");
}

export function appendJournalEvent(cwd: string, event: Omit<JournalEvent, "ts">): void {
  const line = { ts: new Date().toISOString(), ...event };
  appendFileSync(journalPath(cwd), `${JSON.stringify(line)}\n`);
}

export function readJournal(cwd: string): JournalEvent[] {
  const path = journalPath(cwd);
  if (!existsSync(path)) return [];

  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as JournalEvent);
}
