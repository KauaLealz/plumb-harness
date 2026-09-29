import type { Command } from "commander";
import { readJournal } from "../lib/journal.js";
import { deliveriesSinceLastDream, isDreamDue } from "../lib/stats.js";
import { readConfigValue } from "../lib/config.js";

export function registerDreamDueCommand(program: Command): void {
  program
    .command("dream-due")
    .description("Check whether a dream cycle is due, per PLUMB_DREAM_EVERY_N_DELIVERIES")
    .action(() => {
      const cwd = process.cwd();
      const threshold = Number(readConfigValue(cwd, "PLUMB_DREAM_EVERY_N_DELIVERIES") ?? "10");
      const events = readJournal(cwd);
      const deliveries = deliveriesSinceLastDream(events);
      const due = isDreamDue(events, threshold);

      console.log(`${deliveries}/${threshold} deliveries since the last dream cycle.`);
      console.log(due ? "Dream cycle is due." : "Not due yet.");
      process.exitCode = due ? 0 : 1;
    });
}
