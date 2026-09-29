import type { Command } from "commander";
import { checkPlumbDir } from "../lib/doctor.js";
import { scaffoldPlumbDir, writePlumbLock } from "../lib/plumbDir.js";
import { applyAgentsFile } from "../lib/agentsFile.js";
import { getPlumbVersion } from "../lib/version.js";

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check that .plumb/, plumb.lock and AGENTS.md are in a valid state")
    .option("--fix", "create anything that's missing, without touching what already exists")
    .action((options: { fix?: boolean }) => {
      const cwd = process.cwd();

      if (options.fix) {
        scaffoldPlumbDir(cwd);
        writePlumbLock(cwd, getPlumbVersion());
        applyAgentsFile(cwd);
      }

      const issues = checkPlumbDir(cwd);

      if (issues.length === 0) {
        console.log("Plumb setup looks good.");
        return;
      }

      console.log(`${issues.length} issue(s) found:`);
      for (const issue of issues) {
        console.log(`  - [${issue.code}] ${issue.message}`);
      }
      if (!options.fix) {
        console.log("");
        console.log("Run `plumb doctor --fix` to create what's missing.");
      }
      process.exitCode = 1;
    });
}
