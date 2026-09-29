import type { Command } from "commander";
import {
  detectAITools,
  checkProfile,
  installSkillsGlobally,
  writeManifest,
  uninstallGlobal,
  type Profile,
} from "../lib/globalInstall.js";

export function registerInstallCommand(program: Command): void {
  program
    .command("install")
    .description("Global install: skills into ~/.claude/skills/ so the orchestrator activates in any repo, plus a profile-based tool check")
    .option("--profile <profile>", "minimal | standard | full", "standard")
    .option("--yes", "skip the confirmation prompt (non-interactive)")
    .action((options: { profile: Profile; yes?: boolean }) => {
      const profile = options.profile;
      if (!["minimal", "standard", "full"].includes(profile)) {
        console.error(`Unknown profile "${profile}". Expected: minimal | standard | full`);
        process.exitCode = 1;
        return;
      }

      const tools = detectAITools();
      console.log(`Detected: Claude Code ${tools.claudeCode ? "yes" : "no"}, Cursor ${tools.cursor ? "yes" : "no"}`);
      console.log(`Profile: ${profile}`);
      console.log("");
      console.log("This will:");
      console.log("  - Copy skills/plumb* into ~/.claude/skills/ (global — activates in ANY repo)");
      console.log(`  - Check ${checkProfile(profile).length} tools for this profile (report only for anything not automatable)`);
      console.log("");

      if (!options.yes) {
        console.log("Re-run with --yes to proceed non-interactively, or confirm in your agent session.");
        return;
      }

      const installedSkills = installSkillsGlobally();
      console.log(`Installed ${installedSkills.length} skills globally: ${installedSkills.join(", ")}`);

      console.log("");
      console.log("Profile checks:");
      let allAutomatedOk = true;
      for (const check of checkProfile(profile)) {
        console.log(`  [${check.ok ? "ok" : "  "}] ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
        if (check.automated && !check.ok) allAutomatedOk = false;
      }

      writeManifest(profile);
      console.log("");
      console.log("Manifest written to ~/.plumb/manifest.json. Run `plumb uninstall` to remove the global install.");
      if (!allAutomatedOk) process.exitCode = 1;
    });

  program
    .command("uninstall")
    .description("Remove the global skill install (per ~/.plumb/manifest.json). Never touches per-project .plumb/ directories.")
    .action(() => {
      const removed = uninstallGlobal();
      if (removed.length === 0) {
        console.log("Nothing to uninstall (no manifest found).");
        return;
      }
      console.log(`Removed from ~/.claude/skills/: ${removed.join(", ")}`);
    });
}
