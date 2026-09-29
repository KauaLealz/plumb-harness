import type { Command } from "commander";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { readConfigValue } from "../lib/config.js";
import { remember, recall, exportMemory, listConflicts, applyPolicyDryRun, type MemoryType } from "../lib/memanto.js";
import { copyRecursive } from "../lib/fsUtil.js";

function requireAgent(cwd: string): string | null {
  const agentId = readConfigValue(cwd, "PLUMB_MEMANTO_AGENT");
  if (!agentId) {
    console.error(
      "No PLUMB_MEMANTO_AGENT configured in .plumb/config.env. Run `plumb init` (or `plumb doctor --fix`) to create the project's Memanto agent.",
    );
    return null;
  }
  return agentId;
}

export function registerMemCommand(program: Command): void {
  const mem = program.command("mem").description("Read and write durable memory via Memanto");

  mem
    .command("remember")
    .description("Store a durable fact for this project's agent")
    .argument("<content>", "the fact to remember")
    .requiredOption("--type <type>", "decision|instruction|learning|error|fact|...")
    .option("--tags <tags>", "comma-separated tags")
    .action((content: string, options: { type: MemoryType; tags?: string }) => {
      const cwd = process.cwd();
      const agentId = requireAgent(cwd);
      if (!agentId) {
        process.exitCode = 1;
        return;
      }

      const result = remember(agentId, content, {
        type: options.type,
        tags: options.tags ? options.tags.split(",").map((t) => t.trim()) : undefined,
      });

      process.stdout.write(result.stdout);
      if (!result.ok) {
        process.stderr.write(result.stderr);
        process.exitCode = 1;
      }
    });

  mem
    .command("recall")
    .description("Search this project's agent memory")
    .argument("[query]", "search query; omit with --recent")
    .option("--type <type>", "filter by memory type")
    .option("--limit <n>", "maximum results", (v) => Number(v))
    .option("--recent", "chronological listing instead of a search query")
    .action((query: string | undefined, options: { type?: MemoryType; limit?: number; recent?: boolean }) => {
      const cwd = process.cwd();
      const agentId = requireAgent(cwd);
      if (!agentId) {
        process.exitCode = 1;
        return;
      }

      const result = recall(agentId, query ?? "", options);
      process.stdout.write(result.stdout);
      if (!result.ok) {
        process.stderr.write(result.stderr);
        process.exitCode = 1;
      }
    });

  mem
    .command("export")
    .description("Export the team's durable memory to .plumb/memory/ (OKF bundle), for a colleague's `plumb setup` to import")
    .action(() => {
      const cwd = process.cwd();
      const agentId = requireAgent(cwd);
      if (!agentId) {
        process.exitCode = 1;
        return;
      }

      const result = exportMemory(agentId);
      if (!result.ok || !result.bundlePath) {
        console.error(`Export failed: ${(result.stdout + result.stderr).trim()}`);
        process.exitCode = 1;
        return;
      }

      const dest = join(cwd, ".plumb", "memory");
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
      copyRecursive(result.bundlePath, dest);
      console.log(`Exported to ${dest}`);
    });

  mem
    .command("conflicts")
    .description("List unresolved memory conflicts for this project's agent")
    .action(() => {
      const cwd = process.cwd();
      const agentId = requireAgent(cwd);
      if (!agentId) {
        process.exitCode = 1;
        return;
      }
      process.stdout.write(listConflicts(agentId).stdout);
    });

  mem
    .command("expiring")
    .description("Preview what the project's Memanto expiry policy would expire right now (dry run, nothing is deleted)")
    .action(() => {
      const cwd = process.cwd();
      const agentId = requireAgent(cwd);
      if (!agentId) {
        process.exitCode = 1;
        return;
      }
      process.stdout.write(applyPolicyDryRun(agentId).stdout);
    });
}
