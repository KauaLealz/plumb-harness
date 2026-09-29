import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
// dist/lib/plumbDir.js -> ../../templates (repo root/templates)
export const TEMPLATES_ROOT = join(MODULE_DIR, "..", "..", "templates");

export const PLUMB_SUBDIRS = ["work", "e2e", "mocks", "memory"] as const;

function copyFileIfMissing(src: string, dest: string, force: boolean): boolean {
  if (existsSync(dest) && !force) return false;
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  return true;
}

function copyDirIfMissing(srcDir: string, destDir: string, force: boolean): string[] {
  const written: string[] = [];
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const src = join(srcDir, entry.name);
    const dest = join(destDir, entry.name);
    if (entry.isDirectory()) {
      written.push(...copyDirIfMissing(src, dest, force));
    } else if (copyFileIfMissing(src, dest, force)) {
      written.push(dest);
    }
  }
  return written;
}

export interface ScaffoldOptions {
  force?: boolean;
}

export interface ScaffoldResult {
  plumbDir: string;
  written: string[];
  skipped: string[];
}

/**
 * Creates the .plumb/ tree for a project: config.env, map.md, overlay/,
 * templates/, work/, e2e/, mocks/, memory/, journal.jsonl, dream/.
 * Idempotent: existing files are left untouched unless `force` is set.
 */
export function scaffoldPlumbDir(cwd: string, options: ScaffoldOptions = {}): ScaffoldResult {
  const force = options.force ?? false;
  const plumbDir = join(cwd, ".plumb");
  const written: string[] = [];
  const skipped: string[] = [];

  const track = (path: string, wasWritten: boolean) => {
    (wasWritten ? written : skipped).push(path);
  };

  track(
    join(plumbDir, "config.env"),
    copyFileIfMissing(join(TEMPLATES_ROOT, "config.env"), join(plumbDir, "config.env"), force),
  );
  track(
    join(plumbDir, "map.md"),
    copyFileIfMissing(join(TEMPLATES_ROOT, "map.md"), join(plumbDir, "map.md"), force),
  );

  written.push(
    ...copyDirIfMissing(join(TEMPLATES_ROOT, "overlay"), join(plumbDir, "overlay"), force),
  );
  written.push(
    ...copyDirIfMissing(join(TEMPLATES_ROOT, "artifacts"), join(plumbDir, "templates"), force),
  );
  track(
    join(plumbDir, "dream", "inbox.md"),
    copyFileIfMissing(join(TEMPLATES_ROOT, "dream", "inbox.md"), join(plumbDir, "dream", "inbox.md"), force),
  );

  for (const sub of PLUMB_SUBDIRS) {
    mkdirSync(join(plumbDir, sub), { recursive: true });
  }

  const journalPath = join(plumbDir, "journal.jsonl");
  if (!existsSync(journalPath) || force) {
    writeFileSync(journalPath, "");
    written.push(journalPath);
  } else {
    skipped.push(journalPath);
  }

  return { plumbDir, written, skipped };
}

export interface PlumbLock {
  plumbVersion: string;
  tools: Record<string, { version: string | null; checksum: string | null }>;
}

export function readPlumbLock(cwd: string): PlumbLock | null {
  const path = join(cwd, "plumb.lock");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function writePlumbLock(cwd: string, plumbVersion: string): void {
  const lock: PlumbLock = {
    plumbVersion,
    tools: {
      caveman: { version: null, checksum: null },
      rtk: { version: null, checksum: null },
    },
  };
  writeFileSync(join(cwd, "plumb.lock"), `${JSON.stringify(lock, null, 2)}\n`);
}
