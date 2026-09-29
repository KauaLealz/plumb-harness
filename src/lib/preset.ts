import { existsSync, mkdirSync, copyFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

// A function, not a module-level constant: it must re-read HOME on every
// call (tests stub it per-case, and a long-lived process should never need
// a restart to see a HOME change).
export function presetsRoot(): string {
  return join(homedir(), ".plumb", "presets");
}

// What a preset captures: the answers a previous interview already gave,
// reusable by another project of the same client/stack (plan §5.2, §15).
const PRESET_ENTRIES = ["overlay", "config.env", "map.md"] as const;

function copyRecursive(src: string, dest: string): void {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src, { withFileTypes: true })) {
      copyRecursive(join(src, entry.name), join(dest, entry.name));
    }
  } else {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
  }
}

export function savePreset(cwd: string, name: string): string {
  const presetDir = join(presetsRoot(), name);
  if (existsSync(presetDir)) {
    rmSync(presetDir, { recursive: true, force: true });
  }
  mkdirSync(presetDir, { recursive: true });

  for (const entry of PRESET_ENTRIES) {
    const src = join(cwd, ".plumb", entry);
    if (existsSync(src)) {
      copyRecursive(src, join(presetDir, entry));
    }
  }

  return presetDir;
}

export function listPresets(): string[] {
  if (!existsSync(presetsRoot())) return [];
  return readdirSync(presetsRoot(), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

export function applyPreset(cwd: string, name: string): { applied: string[] } {
  const presetDir = join(presetsRoot(), name);
  if (!existsSync(presetDir)) {
    throw new Error(`No preset named "${name}" in ${presetsRoot()}`);
  }

  const applied: string[] = [];
  for (const entry of PRESET_ENTRIES) {
    const src = join(presetDir, entry);
    if (existsSync(src)) {
      copyRecursive(src, join(cwd, ".plumb", entry));
      applied.push(entry);
    }
  }

  return { applied };
}
