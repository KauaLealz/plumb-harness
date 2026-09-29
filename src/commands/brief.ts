import type { Command } from "commander";
import { buildBrief, type Phase } from "../lib/brief.js";

const VALID_PHASES: Phase[] = ["ready", "specify", "plan", "tasks", "implement", "verify", "review"];

export function registerBriefCommand(program: Command): void {
  program
    .command("brief")
    .description("Write .plumb/work/<id>/brief.md with the memory relevant to starting this phase")
    .argument("<id>", "work item id")
    .argument("<phase>", `one of: ${VALID_PHASES.join(", ")}`)
    .action((id: string, phase: string) => {
      if (!VALID_PHASES.includes(phase as Phase)) {
        console.error(`Unknown phase "${phase}". Expected one of: ${VALID_PHASES.join(", ")}`);
        process.exitCode = 1;
        return;
      }

      const result = buildBrief(process.cwd(), id, phase as Phase);
      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }
      console.log(`Wrote ${result.briefPath}`);
    });
}
