import type { Command } from "commander";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { remember, recall, getBackendName, isBackendAvailable, backendUnavailableMessage, type MemoryType } from "../lib/memory/index.js";
import { exportMemory, listConflicts, applyPolicyDryRun } from "../lib/memanto.js";
import { exportObsidian } from "../lib/memory/obsidianBackend.js";
import { readConfigValue } from "../lib/config.js";
import { copyRecursive } from "../lib/fsUtil.js";

function requireBackend(cwd: string): boolean {
  if (!isBackendAvailable(cwd)) {
    console.error(backendUnavailableMessage(cwd));
    return false;
  }
  return true;
}

function memantoOnly(cwd: string, feature: string): boolean {
  if (getBackendName(cwd) !== "memanto") {
    console.error(`${feature} is Memanto-only — this project's PLUMB_MEMORY_BACKEND is "obsidian".`);
    return false;
  }
  return requireBackend(cwd);
}

export function registerMemCommand(program: Command): void {
  const mem = program.command("mem").description("Read and write durable memory (Memanto or an Obsidian vault, per PLUMB_MEMORY_BACKEND)");

  mem
    .command("remember")
    .description("Store a durable fact")
    .argument("<content>", "the fact to remember")
    .requiredOption("--type <type>", "decision|instruction|learning|error|fact|...")
    .option("--tags <tags>", "comma-separated tags")
    .action((content: string, options: { type: MemoryType; tags?: string }) => {
      const cwd = process.cwd();
      if (!requireBackend(cwd)) {
        process.exitCode = 1;
        return;
      }

      const result = remember(cwd, content, {
        type: options.type,
        tags: options.tags ? options.tags.split(",").map((t) => t.trim()) : undefined,
      });

      process.stdout.write(`${result.stdout}\n`);
      if (!result.ok) {
        process.stderr.write(result.stderr);
        process.exitCode = 1;
      }
    });

  mem
    .command("recall")
    .description("Search memory")
    .argument("[query]", "search query; omit with --recent")
    .option("--type <type>", "filter by memory type")
    .option("--limit <n>", "maximum results", (v) => Number(v))
    .option("--recent", "chronological listing instead of a search query")
    .action((query: string | undefined, options: { type?: MemoryType; limit?: number; recent?: boolean }) => {
      const cwd = process.cwd();
      if (!requireBackend(cwd)) {
        process.exitCode = 1;
        return;
      }

      const result = recall(cwd, query ?? "", options);
      process.stdout.write(`${result.stdout}\n`);
      if (!result.ok) {
        process.stderr.write(result.stderr);
        process.exitCode = 1;
      }
    });

  mem
    .command("export")
    .description("Export durable memory to .plumb/memory/, for a colleague's `plumb setup` to import")
    .action(() => {
      const cwd = process.cwd();
      if (!requireBackend(cwd)) {
        process.exitCode = 1;
        return;
      }

      const result =
        getBackendName(cwd) === "obsidian"
          ? exportObsidian(cwd)
          : exportMemory(readConfigValue(cwd, "PLUMB_MEMANTO_AGENT") ?? "");

      if (!result.ok || !result.bundlePath) {
        console.error(`Export failed: ${"stderr" in result ? result.stderr : ""}`);
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
    .description("List unresolved memory conflicts (Memanto only)")
    .action(() => {
      const cwd = process.cwd();
      if (!memantoOnly(cwd, "Conflict detection")) {
        process.exitCode = 1;
        return;
      }
      process.stdout.write(listConflicts(readConfigValue(cwd, "PLUMB_MEMANTO_AGENT") ?? "").stdout);
    });

  mem
    .command("expiring")
    .description("Preview what the expiry policy would expire right now (Memanto only, dry run)")
    .action(() => {
      const cwd = process.cwd();
      if (!memantoOnly(cwd, "Expiry policies")) {
        process.exitCode = 1;
        return;
      }
      process.stdout.write(applyPolicyDryRun(readConfigValue(cwd, "PLUMB_MEMANTO_AGENT") ?? "").stdout);
    });
}
