import type { Command } from "commander";
import { createWork } from "../lib/work.js";

export function registerNewCommand(program: Command): void {
  program
    .command("new")
    .description("Create a new work item under .plumb/work/<id>/")
    .argument("<id>", "work item id, e.g. a ticket id like PAY-142")
    .action((id: string) => {
      try {
        const workDir = createWork(process.cwd(), id);
        console.log(`Created ${workDir}`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      }
    });
}
