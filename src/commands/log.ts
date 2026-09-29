import type { Command } from "commander";
import { appendJournalEvent, type JournalEventType } from "../lib/journal.js";

const EVENT_TYPES: JournalEventType[] = [
  "phase-start",
  "phase-end",
  "gate",
  "resize",
  "waiver",
  "retry",
  "breaker",
  "review-finding",
  "verify-gap",
  "flaky",
  "escaped-defect",
  "delivery",
  "dream-start",
  "dream-end",
];

export function registerLogCommand(program: Command): void {
  program
    .command("log")
    .description(`Append one line to .plumb/journal.jsonl. Event: ${EVENT_TYPES.join(", ")}`)
    .argument("<event>", "event type")
    .option("--id <id>", "work item id")
    .option("--phase <phase>", "phase name")
    .option("--result <result>", "pass|pass-with-risks|reject, for gate events")
    .option("--reason <reason>", "free-text reason")
    .option("--severity <severity>", "for review-finding events")
    .option("--detail <detail>", "free-text detail")
    .action((event: string, options: Record<string, string | undefined>) => {
      if (!EVENT_TYPES.includes(event as JournalEventType)) {
        console.error(`Unknown event "${event}". Expected one of: ${EVENT_TYPES.join(", ")}`);
        process.exitCode = 1;
        return;
      }

      const fields = Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined));
      appendJournalEvent(process.cwd(), { event: event as JournalEventType, ...fields });
      console.log(`Logged ${event}${options.id ? ` (${options.id})` : ""}`);
    });
}
