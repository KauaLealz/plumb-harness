import type { Command } from "commander";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { discover } from "../lib/discovery.js";
import { scaffoldPlumbDir, writePlumbLock } from "../lib/plumbDir.js";
import { applyAgentsFile } from "../lib/agentsFile.js";
import { getPlumbVersion } from "../lib/version.js";
import { writeConfigValue } from "../lib/config.js";
import { isMemantoAvailable, createProjectAgent } from "../lib/memanto.js";
import { applyPreset } from "../lib/preset.js";

function agentIdFor(cwd: string): string {
  return basename(cwd)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function setUpMemanto(cwd: string): string {
  if (!isMemantoAvailable()) {
    return "Memanto not available (not installed, or no backend configured) — continuing without memory. Run `memanto` to set it up, then `plumb doctor --fix`.";
  }

  const agentId = agentIdFor(cwd);
  const result = createProjectAgent(agentId, `Plumb project agent for ${basename(cwd)}`);
  if (!result.ok && !/already exists/i.test(result.stdout + result.stderr)) {
    return `Could not create the Memanto agent "${agentId}" — continuing without memory. (${(result.stdout + result.stderr).trim() || "unknown error"})`;
  }

  writeConfigValue(cwd, "PLUMB_MEMANTO_AGENT", agentId);
  return result.ok
    ? `Created Memanto agent "${agentId}" for this project.`
    : `Memanto agent "${agentId}" already existed — reusing it.`;
}

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Set up Plumb in the current repository: discover the stack, scaffold .plumb/, and manage AGENTS.md")
    .option("--from <preset>", "apply a saved preset's overlay/config/map right after scaffolding")
    .action((options: { from?: string }) => {
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

      // Preset applies BEFORE the Memanto agent is created: a preset's
      // config.env fully overwrites this project's, and it must never be
      // allowed to clobber the PLUMB_MEMANTO_AGENT written right after.
      if (options.from) {
        try {
          const applied = applyPreset(cwd, options.from);
          console.log(`Applied preset "${options.from}": ${applied.applied.join(", ") || "nothing to apply"}`);
        } catch (error) {
          console.error(error instanceof Error ? error.message : String(error));
        }
      }

      console.log(setUpMemanto(cwd));
      console.log("");
      console.log("Next: run the `plumb-init` skill inside your AI coding tool to complete the interview.");
    });
}
