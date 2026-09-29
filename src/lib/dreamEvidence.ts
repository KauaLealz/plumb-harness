import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readJournal, type JournalEvent } from "./journal.js";
import { summarize } from "./stats.js";

function section(title: string, events: JournalEvent[], line: (e: JournalEvent) => string): string {
  if (events.length === 0) return `## ${title}\n\nNone.\n`;
  return `## ${title}\n\n${events.map((e) => `- ${line(e)}`).join("\n")}\n`;
}

/** Everything §16's dream cycle reads as evidence, gathered deterministically
 * (this is discovery work — the CLI's job, not the skill's). */
export function buildEvidence(cwd: string): string {
  const events = readJournal(cwd);
  const stats = summarize(events);

  const inboxPath = join(cwd, ".plumb", "dream", "inbox.md");
  const inbox = existsSync(inboxPath) ? readFileSync(inboxPath, "utf8").trim() : "";

  const parts = [
    "# Dream evidence",
    "",
    `Journal: ${stats.totalEvents} events. ${Object.entries(stats.byEvent)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")}`,
    "",
    `## Inbox\n\n${inbox || "None."}\n`,
    section(
      "Rejections",
      events.filter((e) => e.event === "gate" && e.result === "reject"),
      (e) => `[${e.id ?? "?"}] ${e.phase}: ${e.reason ?? "no reason given"}`,
    ),
    section(
      "Review findings",
      events.filter((e) => e.event === "review-finding"),
      (e) => `[${e.id ?? "?"}] ${e.severity ?? "?"}: ${e.detail ?? e.reason ?? ""}`,
    ),
    section(
      "Verify gaps",
      events.filter((e) => e.event === "verify-gap"),
      (e) => `[${e.id ?? "?"}] ${e.detail ?? e.reason ?? ""}`,
    ),
    section(
      "Waivers",
      events.filter((e) => e.event === "waiver"),
      (e) => `[${e.id ?? "?"}] ${e.detail ?? e.reason ?? ""}`,
    ),
    section(
      "Escaped defects",
      events.filter((e) => e.event === "escaped-defect"),
      (e) => `[${e.id ?? "?"}] ${e.detail ?? e.reason ?? ""}`,
    ),
    section(
      "Flaky",
      events.filter((e) => e.event === "flaky"),
      (e) => `[${e.id ?? "?"}] ${e.detail ?? e.reason ?? ""}`,
    ),
  ];

  return parts.join("\n");
}
