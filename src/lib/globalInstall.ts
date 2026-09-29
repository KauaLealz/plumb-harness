import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { copyRecursive } from "./fsUtil.js";
import { SKILLS_SOURCE_ROOT } from "./skillsInstall.js";

export interface DetectedTools {
  claudeCode: boolean;
  cursor: boolean;
}

/** Cursor's config path isn't verified the way Claude Code's is (see
 * docs/compatibility.md) — this only checks a plausible directory exists,
 * it does not claim Cursor integration works. */
export function detectAITools(): DetectedTools {
  return {
    claudeCode: existsSync(join(homedir(), ".claude")),
    cursor: existsSync(join(homedir(), ".cursor")) || existsSync(join(homedir(), ".config", "Cursor")),
  };
}

export type Profile = "minimal" | "standard" | "full";

export interface ToolCheck {
  name: string;
  profile: Profile;
  automated: boolean;
  ok: boolean;
  detail: string;
}

function commandExists(cmd: string): boolean {
  return spawnSync(cmd, ["--version"], { encoding: "utf8" }).status === 0;
}

/** What each profile adds on top of the previous one (plan §5.1 table). */
export function checkProfile(profile: Profile): ToolCheck[] {
  const checks: ToolCheck[] = [
    {
      name: "plumb CLI on PATH",
      profile: "minimal",
      automated: true,
      ok: commandExists("plumb"),
      detail: commandExists("plumb") ? "" : "run `npm link` (dev) or publish + `npm install -g plumb-harness`",
    },
    {
      name: "Caveman (RTK bundled in it)",
      profile: "minimal",
      automated: false,
      ok: existsSync(join(homedir(), ".claude", "plugins", "cache", "caveman")),
      detail: "install via the Claude Code plugin marketplace if missing — not installed by plumb",
    },
  ];

  if (profile === "standard" || profile === "full") {
    checks.push(
      {
        name: "Memanto",
        profile: "standard",
        automated: false,
        ok: commandExists("memanto"),
        detail: commandExists("memanto") ? "" : "run: uv tool install memanto (or pip install --user memanto)",
      },
      {
        name: "secrets MCP",
        profile: "standard",
        automated: false,
        ok: false, // presence can't be checked from a plain subprocess — MCP servers are only reachable from an agent session
        detail: "detected only from inside a Claude Code session (`claude mcp list`) — not checkable from this CLI process",
      },
      {
        name: "Playwright CLI",
        profile: "standard",
        automated: false,
        ok: commandExists("playwright"),
        detail: commandExists("playwright") ? "" : "run: npx playwright install",
      },
    );
  }

  if (profile === "full") {
    checks.push(
      { name: "Serena (MCP)", profile: "full", automated: false, ok: false, detail: "install via Claude Code plugin marketplace" },
      { name: "Context7 (MCP)", profile: "full", automated: false, ok: false, detail: "claude mcp add context7 ..." },
      { name: "Docker (for WireMock)", profile: "full", automated: false, ok: commandExists("docker"), detail: commandExists("docker") ? "" : "install Docker" },
      { name: "Hurl", profile: "full", automated: false, ok: commandExists("hurl"), detail: commandExists("hurl") ? "" : "install via your package manager" },
    );
  }

  return checks;
}

function manifestPath(): string {
  return join(homedir(), ".plumb", "manifest.json");
}

export interface Manifest {
  installedAt: string;
  profile: Profile;
  globalSkillsPath: string;
}

export function writeManifest(profile: Profile): void {
  const manifest: Manifest = {
    installedAt: new Date().toISOString(),
    profile,
    globalSkillsPath: join(homedir(), ".claude", "skills"),
  };
  mkdirSync(join(homedir(), ".plumb"), { recursive: true });
  writeFileSync(manifestPath(), `${JSON.stringify(manifest, null, 2)}\n`);
}

export function readManifest(): Manifest | null {
  const path = manifestPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/** Same target directory `plumb init` uses per-project, but here it's
 * ~/.claude/skills/ so the orchestrator can activate in ANY repo — even
 * one that has never run `plumb init` — and propose setting Plumb up. */
export function installSkillsGlobally(): string[] {
  const destRoot = join(homedir(), ".claude", "skills");
  const installed: string[] = [];

  for (const entry of readdirSync(SKILLS_SOURCE_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dest = join(destRoot, entry.name);
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    copyRecursive(join(SKILLS_SOURCE_ROOT, entry.name), dest);
    installed.push(entry.name);
  }

  return installed;
}

export function uninstallGlobal(): string[] {
  const manifest = readManifest();
  if (!manifest) return [];

  const removed: string[] = [];
  const skillsRoot = join(homedir(), ".claude", "skills");

  if (existsSync(skillsRoot)) {
    for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && (entry.name === "plumb" || entry.name.startsWith("plumb-"))) {
        rmSync(join(skillsRoot, entry.name), { recursive: true, force: true });
        removed.push(entry.name);
      }
    }
  }

  rmSync(manifestPath(), { force: true });
  return removed;
}
