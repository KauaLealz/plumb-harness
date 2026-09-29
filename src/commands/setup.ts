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

      const backend = readConfigValue(cwd, "PLUMB_MEMORY_BACKEND") === "obsidian" ? "obsidian" : "memanto";

      if (backend === "obsidian") {
        const vaultPath = readConfigValue(cwd, "PLUMB_OBSIDIAN_VAULT_PATH");
        console.log(
          vaultPath && existsSync(vaultPath)
            ? `Memory backend is Obsidian — point this machine's PLUMB_OBSIDIAN_VAULT_PATH at your own vault if it differs from "${vaultPath}".`
            : `Memory backend is Obsidian but PLUMB_OBSIDIAN_VAULT_PATH ("${vaultPath ?? "unset"}") doesn't exist on this machine — set it in .plumb/config.env.`,
        );
      } else {
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
      }

      console.log("");
      console.log("Manual steps this command doesn't automate yet: per-tool MCP configuration.");
      console.log("Local secrets: never paste into config.env or the conversation — use the `secrets` MCP");
      console.log("(create_secret, then apply_secrets_to_file/run_with_secret to consume). See docs/secrets.md.");
    });
}
