import type { Command } from "commander";
import { discover } from "../lib/discovery.js";

export function registerDiscoverCommand(program: Command): void {
  program
    .command("discover")
    .description("Detect the project's stack without writing anything")
    .option("--json", "print machine-readable JSON instead of text")
    .action((options: { json?: boolean }) => {
      const result = discover(process.cwd());

      if (options.json) {
        process.stdout.write(`${JSON.stringify(result)}\n`);
        return;
      }

      console.log(`Language:         ${result.language ?? "unknown"}`);
      console.log(`Package manager:  ${result.packageManager ?? "unknown"}`);
      console.log(`Test framework:   ${result.testFramework ?? "unknown"}`);
      console.log(`Docker:           ${result.hasDocker ? "yes" : "no"}`);
      console.log(`CI:               ${result.hasCI ? "yes" : "no"}`);
      console.log(`Services:         ${result.services.length ? result.services.join(", ") : "none detected"}`);
      console.log(`Git remote:       ${result.gitRemote ?? "none"}`);
    });
}
