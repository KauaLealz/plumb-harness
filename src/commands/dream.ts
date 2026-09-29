import type { Command } from "commander";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildEvidence } from "../lib/dreamEvidence.js";

export function registerDreamCommand(program: Command): void {
  const dream = program.command("dream").description("Deterministic support for the dream cycle (skill plumb-dream does the diagnosis)");

  dream
    .command("evidence")
    .description("Gather journal stats, inbox, rejections, findings, gaps, waivers and escaped defects into .plumb/dream/evidence.md")
    .action(() => {
      const cwd = process.cwd();
      const evidence = buildEvidence(cwd);
      const path = join(cwd, ".plumb", "dream", "evidence.md");
      writeFileSync(path, evidence);
      console.log(`Wrote ${path}`);
    });
}
