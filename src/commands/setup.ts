import type { Command } from "commander";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readConfigValue } from "../lib/config.js";
import { isMemantoAvailable, createProjectAgent } from "../lib/memanto.js";
import { checkPlumbDir } from "../lib/doctor.js";

export function registerSetupCommand(program: Command): void {
  program
    .command("setup")
    .description("Set up Plumb on this machine for a project that was cloned already configured")
    .action(() => {
      const cwd = process.cwd();

      const issues = checkPlumbDir(cwd);
      if (issues.some((i) => i.code === "missing-plumb-dir")) {
        console.error("No .plumb/ here. This isn't a Plumb-configured repo — run `plumb init` instead.");
        process.exitCode = 1;
        return;
      }
      if (issues.length > 0) {
        console.log(`${issues.length} structural issue(s) found; run \`plumb doctor --fix\` first.`);
      }

      const agentId = readConfigValue(cwd, "PLUMB_MEMANTO_AGENT");
      if (!agentId) {
        console.log("No PLUMB_MEMANTO_AGENT in config.env — nothing to set up on the memory side.");
      } else if (!isMemantoAvailable()) {
        console.log("Memanto not available on this machine — continuing without memory. Run `memanto` to set it up.");
      } else {
        // Each developer's on-prem Memanto is local to their own machine, so
        // the project's agent needs to exist here too, not just on whoever
        // ran `plumb init` first.
        const result = createProjectAgent(agentId, `Plumb project agent for ${agentId}`);
        if (result.ok) {
          console.log(`Created local Memanto agent "${agentId}".`);
        } else if (/already exists/i.test(result.stdout + result.stderr)) {
          console.log(`Memanto agent "${agentId}" already exists locally.`);
        } else {
          console.log(`Could not set up the Memanto agent "${agentId}" locally: ${(result.stdout + result.stderr).trim()}`);
        }
      }

      const memoryDir = join(cwd, ".plumb", "memory");
      const hasTeamMemory = existsSync(memoryDir) && readdirSync(memoryDir).length > 0;
      if (hasTeamMemory) {
        console.log(`.plumb/memory/ has team memory exports — import them with \`memanto migrate\` (see docs).`);
      }

      console.log("");
      console.log("Manual steps this command doesn't automate yet: per-tool MCP configuration, and local secrets (never committed).");
    });
}
