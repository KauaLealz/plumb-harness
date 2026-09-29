import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export interface AgentCheck {
  name: string;
  ok: boolean;
  detail?: string;
}

export interface ToolReport {
  tool: string;
  checks: AgentCheck[];
}

function hasClaudeSkills(cwd: string): boolean {
  return existsSync(join(cwd, ".claude", "skills", "plumb", "SKILL.md"));
}

function hasManagedAgentsBlock(cwd: string): boolean {
  const path = join(cwd, "AGENTS.md");
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  return content.includes("<!-- plumb:begin") && content.includes("<!-- plumb:end -->");
}

interface SettingsHookMatcher {
  hooks?: { command?: string }[];
}

function hasClaudeHooks(cwd: string): boolean {
  const path = join(cwd, ".claude", "settings.json");
  if (!existsSync(path)) return false;
  try {
    const settings = JSON.parse(readFileSync(path, "utf8")) as {
      hooks?: { PreToolUse?: SettingsHookMatcher[] };
    };
    const preToolUse = settings.hooks?.PreToolUse ?? [];
    return preToolUse.some((m) => m.hooks?.some((h) => h.command === "plumb hooks cache-guard"));
  } catch {
    return false;
  }
}

export function checkClaudeCode(cwd: string): ToolReport {
  return {
    tool: "Claude Code",
    checks: [
      { name: "skills installed (.claude/skills/plumb/)", ok: hasClaudeSkills(cwd) },
      { name: "AGENTS.md managed block", ok: hasManagedAgentsBlock(cwd) },
      { name: "hooks installed (.claude/settings.json)", ok: hasClaudeHooks(cwd) },
    ],
  };
}

export function checkCursor(cwd: string): ToolReport {
  return {
    tool: "Cursor",
    checks: [
      { name: "AGENTS.md present (read natively)", ok: hasManagedAgentsBlock(cwd) },
      {
        name: "skills installed",
        ok: false,
        detail: "not automated yet — Cursor's skill directory convention isn't verified",
      },
      {
        name: "hooks installed",
        ok: false,
        detail: "not automated yet — Cursor's hook support isn't verified",
      },
    ],
  };
}

const LIVE_PROMPT =
  "implemente a mudança X neste repositório de teste; descreva só o primeiro passo, não edite nada ainda.";

// Keywords a response that actually engaged the orchestrator skill would
// plausibly use — a heuristic, not a certainty (plan §6.5 frames this the
// same way: a cheap live smoke test, not a proof).
const ENGAGEMENT_MARKERS = [/\bplumb\b/i, /\.plumb\//, /\bready\b/i, /\bspecify\b/i, /\bgate\b/i, /\bsize/i];

export interface LiveCheckResult {
  ran: boolean;
  engaged: boolean;
  response: string;
}

export function runLiveCheck(cwd: string): LiveCheckResult {
  const result = spawnSync("claude", ["-p", LIVE_PROMPT, "--permission-mode", "bypassPermissions"], {
    cwd,
    encoding: "utf8",
    timeout: 120_000,
  });

  if (result.error || result.status !== 0) {
    return { ran: false, engaged: false, response: result.stderr || result.error?.message || "unknown error" };
  }

  const response = result.stdout.trim();
  return { ran: true, engaged: ENGAGEMENT_MARKERS.some((m) => m.test(response)), response };
}
