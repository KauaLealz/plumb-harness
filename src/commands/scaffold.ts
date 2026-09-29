import type { Command } from "commander";
import { scaffoldPlumbDir, writePlumbLock } from "../lib/plumbDir.js";
import { getPlumbVersion } from "../lib/version.js";

export function registerScaffoldCommand(program: Command): void {
  program
    .command("scaffold")
    .description("Create (or fill in) the .plumb/ tree and plumb.lock, without touching AGENTS.md")
    .option("--force", "overwrite files that already exist")
    .action((options: { force?: boolean }) => {
      const result = scaffoldPlumbDir(process.cwd(), { force: options.force });
      writePlumbLock(process.cwd(), getPlumbVersion());

      console.log(`.plumb/ ready at ${result.plumbDir}`);
      console.log(`  written: ${result.written.length}`);
      console.log(`  already present: ${result.skipped.length}`);
    });
}
