import type { Command } from "commander";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { listWork, type WorkSummary } from "../lib/work.js";

export interface StatusResult {
  cwd: string;
  hasPlumbDir: boolean;
  work: WorkSummary[];
}

export function getStatus(cwd: string): StatusResult {
  const hasPlumbDir = existsSync(join(cwd, ".plumb"));
  return {
    cwd,
    hasPlumbDir,
    work: hasPlumbDir ? listWork(cwd) : [],
  };
}

export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Show whether the current repository has Plumb set up and list active work items")
    .option("--json", "print machine-readable JSON instead of text")
    .action((options: { json?: boolean }) => {
      const result = getStatus(process.cwd());

      if (options.json) {
        process.stdout.write(`${JSON.stringify(result)}\n`);
        return;
      }

      if (!result.hasPlumbDir) {
        console.log(`No .plumb/ found in ${result.cwd}. Run \`plumb init\` to set it up.`);
        return;
      }

      console.log(`Plumb is set up in ${result.cwd}`);
      if (result.work.length === 0) {
        console.log("No work items yet. Run `plumb new <id>` to start one.");
        return;
      }

      for (const item of result.work) {
        console.log(`  ${item.id} — phase: ${item.phase ?? "unknown"}, size: ${item.size ?? "unknown"}`);
      }
    });
}
