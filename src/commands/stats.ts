import type { Command } from "commander";
import { readJournal } from "../lib/journal.js";
import { summarize } from "../lib/stats.js";

export function registerStatsCommand(program: Command): void {
  program
    .command("stats")
    .description("Summarize .plumb/journal.jsonl — event counts, rejections by phase, flaky/verify-gap/escaped-defect totals")
    .option("--json", "print machine-readable JSON instead of text")
    .action((options: { json?: boolean }) => {
      const stats = summarize(readJournal(process.cwd()));

      if (options.json) {
        process.stdout.write(`${JSON.stringify(stats)}\n`);
        return;
      }

      console.log(`Total events: ${stats.totalEvents}`);
      for (const [event, count] of Object.entries(stats.byEvent).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${event}: ${count}`);
      }
      if (Object.keys(stats.rejectionsByPhase).length > 0) {
        console.log("Rejections by phase:");
        for (const [phase, count] of Object.entries(stats.rejectionsByPhase)) {
          console.log(`  ${phase}: ${count}`);
        }
      }
      console.log(`Flaky: ${stats.flakyCount} | Verify gaps: ${stats.verifyGapCount} | Escaped defects: ${stats.escapedDefectCount}`);
    });
}
