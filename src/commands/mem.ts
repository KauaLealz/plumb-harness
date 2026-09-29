import type { Command } from "commander";
import { readConfigValue } from "../lib/config.js";
import { remember, recall, type MemoryType } from "../lib/memanto.js";

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
}
