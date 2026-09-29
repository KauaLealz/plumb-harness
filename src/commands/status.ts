import type { Command } from "commander";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface StatusResult {
  cwd: string;
  hasPlumbDir: boolean;
}

export function getStatus(cwd: string): StatusResult {
  return {
    cwd,
    hasPlumbDir: existsSync(join(cwd, ".plumb")),
  };
}

export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Show whether the current repository has Plumb set up")
    .option("--json", "print machine-readable JSON instead of text")
    .action((options: { json?: boolean }) => {
      const result = getStatus(process.cwd());

      if (options.json) {
        process.stdout.write(`${JSON.stringify(result)}\n`);
        return;
      }

      if (result.hasPlumbDir) {
        console.log(`Plumb is set up in ${result.cwd}`);
      } else {
        console.log(`No .plumb/ found in ${result.cwd}. Run \`plumb init\` to set it up.`);
      }
    });
}
