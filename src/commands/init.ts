import type { Command } from "commander";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { discover } from "../lib/discovery.js";
import { scaffoldPlumbDir, writePlumbLock } from "../lib/plumbDir.js";
import { applyAgentsFile } from "../lib/agentsFile.js";
import { getPlumbVersion } from "../lib/version.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Set up Plumb in the current repository: discover the stack, scaffold .plumb/, and manage AGENTS.md")
    .action(() => {
      const cwd = process.cwd();

      if (!existsSync(join(cwd, ".git"))) {
        console.error("Not a git repository. Run `plumb init` from the root of a git repo.");
        process.exitCode = 1;
        return;
      }

      const result = discover(cwd);
      const scaffold = scaffoldPlumbDir(cwd);
      writePlumbLock(cwd, getPlumbVersion());
      const agents = applyAgentsFile(cwd);

      console.log(`Detected: ${result.language ?? "unknown language"}${result.testFramework ? `, ${result.testFramework}` : ""}`);
      console.log(`.plumb/ created at ${scaffold.plumbDir} (${scaffold.written.length} files)`);
      console.log(`${agents.wasCreated ? "Created" : "Updated"} ${agents.agentsPath}`);
      if (agents.bridgesCreated.length > 0) {
        console.log(`Created bridge files: ${agents.bridgesCreated.join(", ")}`);
      }
      console.log("");
      console.log("Next: run the `plumb-init` skill inside your AI coding tool to complete the interview.");
    });
}
