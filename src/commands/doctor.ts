import type { Command } from "commander";
import { checkPlumbDir } from "../lib/doctor.js";
import { scaffoldPlumbDir, writePlumbLock } from "../lib/plumbDir.js";
import { applyAgentsFile } from "../lib/agentsFile.js";
import { getPlumbVersion } from "../lib/version.js";
import { installSkillsForClaudeCode } from "../lib/skillsInstall.js";
import { installHooks } from "../lib/hooksInstall.js";
import { checkClaudeCode, checkCursor, runLiveCheck, type ToolReport } from "../lib/agentsDoctor.js";

function printReport(report: ToolReport): boolean {
  console.log(report.tool + ":");
  let allOk = true;
  for (const check of report.checks) {
    console.log(`  [${check.ok ? "ok" : "  "}] ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
    if (!check.ok) allOk = false;
  }
  return allOk;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check that .plumb/, plumb.lock and AGENTS.md are in a valid state")
    .option("--fix", "create anything that's missing, without touching what already exists")
    .option("--agents", "also check whether Claude Code/Cursor are wired to recognize Plumb")
    .option("--live", "with --agents: run a real non-interactive prompt and check if the orchestrator engaged")
    .action((options: { fix?: boolean; agents?: boolean; live?: boolean }) => {
      const cwd = process.cwd();

      if (options.fix) {
        scaffoldPlumbDir(cwd);
        writePlumbLock(cwd, getPlumbVersion());
        applyAgentsFile(cwd);
        installSkillsForClaudeCode(cwd);
        installHooks(cwd);
      }

      const issues = checkPlumbDir(cwd);

      if (issues.length === 0) {
        console.log("Plumb setup looks good.");
      } else {
        console.log(`${issues.length} issue(s) found:`);
        for (const issue of issues) {
          console.log(`  - [${issue.code}] ${issue.message}`);
        }
        if (!options.fix) {
          console.log("");
          console.log("Run `plumb doctor --fix` to create what's missing.");
        }
        process.exitCode = 1;
      }

      if (options.agents) {
        console.log("");
        const claudeOk = printReport(checkClaudeCode(cwd));
        console.log("");
        printReport(checkCursor(cwd));
        if (!claudeOk) process.exitCode = 1;

        if (options.live) {
          console.log("");
          console.log("Live check (Claude Code): running a short non-interactive prompt...");
          const live = runLiveCheck(cwd);
          if (!live.ran) {
            console.log(`  Could not run: ${live.response}`);
            process.exitCode = 1;
          } else {
            console.log(`  Orchestrator ${live.engaged ? "engaged" : "did NOT engage"} (heuristic).`);
            console.log(`  Response: ${live.response.slice(0, 300)}${live.response.length > 300 ? "..." : ""}`);
            if (!live.engaged) process.exitCode = 1;
          }
        }
      }
    });
}
