import type { Command } from "commander";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { readStdinJson } from "../lib/stdin.js";
import { isProtectedPath, CACHE_GUARD_MESSAGE } from "../lib/hooks/cacheGuard.js";
import { isGuardedCommand, hasApprovedReviewGate, GATE_GUARD_MESSAGE } from "../lib/hooks/gateGuard.js";
import { workIdFromStateMdPath, parsePhase } from "../lib/hooks/journalPhase.js";
import { appendJournalEvent, readJournal } from "../lib/journal.js";
import { installHooks } from "../lib/hooksInstall.js";
import { getStatus } from "./status.js";

interface PreToolUsePayload {
  cwd: string;
  tool_name: string;
  tool_input: { file_path?: string; command?: string };
}

export function registerHooksCommand(program: Command): void {
  const hooks = program.command("hooks").description("Claude Code hook handlers, invoked via stdin JSON");

  hooks
    .command("cache-guard")
    .description("PreToolUse: block edits to AGENTS.md, skills/, .plumb/overlay/ mid-session")
    .action(() => {
      const payload = readStdinJson<PreToolUsePayload>();
      const filePath = payload.tool_input.file_path;
      if (filePath && isProtectedPath(filePath)) {
        console.error(CACHE_GUARD_MESSAGE);
        process.exitCode = 2;
      }
    });

  hooks
    .command("gate-guard")
    .description("PreToolUse: block push/PR without an approved review gate in the journal")
    .action(() => {
      const payload = readStdinJson<PreToolUsePayload>();
      const command = payload.tool_input.command;
      if (command && isGuardedCommand(command) && !hasApprovedReviewGate(readJournal(payload.cwd))) {
        console.error(GATE_GUARD_MESSAGE);
        process.exitCode = 2;
      }
    });

  hooks
    .command("journal-phase")
    .description("PostToolUse: auto-log a phase-start event when state.md's Fase atual changes")
    .action(() => {
      const payload = readStdinJson<PreToolUsePayload>();
      const filePath = payload.tool_input.file_path;
      if (!filePath) return;

      const id = workIdFromStateMdPath(filePath);
      if (!id || !existsSync(filePath)) return;

      const phase = parsePhase(readFileSync(filePath, "utf8"));
      if (!phase) return;

      const markerDir = join(payload.cwd, ".plumb", "hooks");
      const markerPath = join(markerDir, `.last-phase-${id}`);
      const lastPhase = existsSync(markerPath) ? readFileSync(markerPath, "utf8").trim() : null;
      if (lastPhase === phase) return;

      mkdirSync(markerDir, { recursive: true });
      writeFileSync(markerPath, phase);
      appendJournalEvent(payload.cwd, { event: "phase-start", id, phase });
    });

  hooks
    .command("session-start")
    .description("SessionStart: print a short Plumb status line")
    .action(() => {
      const payload = readStdinJson<{ cwd: string }>();
      const status = getStatus(payload.cwd);
      if (!status.hasPlumbDir) return;

      console.log(`Plumb is set up here. ${status.work.length} active work item(s).`);
      for (const item of status.work) {
        console.log(`  ${item.id} — phase: ${item.phase ?? "unknown"}`);
      }
    });

  hooks
    .command("install")
    .description("Install Plumb's hooks into .claude/settings.json (idempotent)")
    .action(() => {
      const result = installHooks(process.cwd());
      if (result.installed.length > 0) console.log(`Installed: ${result.installed.join(", ")}`);
      if (result.alreadyPresent.length > 0) console.log(`Already present: ${result.alreadyPresent.join(", ")}`);
    });
}
