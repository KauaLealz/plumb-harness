import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

interface HookEntry {
  type: "command";
  command: string;
}

interface HookMatcher {
  matcher: string;
  hooks: HookEntry[];
}

interface ClaudeSettings {
  hooks?: Record<string, HookMatcher[]>;
  [key: string]: unknown;
}

const PLUMB_HOOKS: Array<{ event: string; matcher: string; command: string }> = [
  { event: "PreToolUse", matcher: "Edit|Write|MultiEdit", command: "plumb hooks cache-guard" },
  { event: "PreToolUse", matcher: "Bash", command: "plumb hooks gate-guard" },
  { event: "PostToolUse", matcher: "Edit|Write|MultiEdit", command: "plumb hooks journal-phase" },
  { event: "SessionStart", matcher: "", command: "plumb hooks session-start" },
];

function settingsPath(cwd: string): string {
  return join(cwd, ".claude", "settings.json");
}

/** Idempotent: re-running never duplicates an entry whose command already
 * exists under the same event. Never touches hooks Plumb didn't add. */
export function installHooks(cwd: string): { installed: string[]; alreadyPresent: string[] } {
  const path = settingsPath(cwd);
  const settings: ClaudeSettings = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  settings.hooks ??= {};

  const installed: string[] = [];
  const alreadyPresent: string[] = [];

  for (const { event, matcher, command } of PLUMB_HOOKS) {
    settings.hooks[event] ??= [];
    const eventHooks = settings.hooks[event];

    const existingMatcher = eventHooks.find((m) => m.matcher === matcher);
    const target = existingMatcher ?? { matcher, hooks: [] };
    if (!existingMatcher) eventHooks.push(target);

    if (target.hooks.some((h) => h.command === command)) {
      alreadyPresent.push(`${event}:${command}`);
    } else {
      target.hooks.push({ type: "command", command });
      installed.push(`${event}:${command}`);
    }
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(settings, null, 2)}\n`);

  return { installed, alreadyPresent };
}
