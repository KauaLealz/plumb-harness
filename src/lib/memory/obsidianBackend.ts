import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readConfigValue } from "../config.js";
import type { MemoryType } from "../memanto.js";

export interface ObsidianResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function vaultPath(cwd: string): string | null {
  return readConfigValue(cwd, "PLUMB_OBSIDIAN_VAULT_PATH");
}

function namespaceFor(cwd: string): string {
  return readConfigValue(cwd, "PLUMB_MEMANTO_AGENT") ?? "project";
}

// <vault>/Plumb/<namespace>/memories/<type>/<slug>.md — mirrors Memanto's
// OKF export layout (memories/<type>/<slug>.md) so the two backends stay
// conceptually swappable, not just interface-compatible.
function memoriesDir(vault: string, namespace: string, type: MemoryType): string {
  return join(vault, "Plumb", namespace, "memories", type);
}

export function isObsidianAvailable(cwd: string): boolean {
  const vault = vaultPath(cwd);
  return !!vault && existsSync(vault);
}

export interface RememberOptions {
  type: MemoryType;
  tags?: string[];
}

export function rememberObsidian(cwd: string, content: string, options: RememberOptions): ObsidianResult {
  const vault = vaultPath(cwd);
  if (!vault) return { ok: false, stdout: "", stderr: "PLUMB_OBSIDIAN_VAULT_PATH not set in config.env" };
  if (!existsSync(vault)) return { ok: false, stdout: "", stderr: `Vault path does not exist: ${vault}` };

  const namespace = namespaceFor(cwd);
  const dir = memoriesDir(vault, namespace, options.type);
  mkdirSync(dir, { recursive: true });

  const id = `${Date.now()}-${slugify(content) || "memory"}`;
  const path = join(dir, `${id}.md`);
  const created = new Date().toISOString();

  const frontmatter = [
    "---",
    `id: ${id}`,
    `type: ${options.type}`,
    `created: ${created}`,
    `source: plumb`,
    options.tags && options.tags.length > 0 ? `tags: [${options.tags.join(", ")}]` : null,
    "---",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  writeFileSync(path, `${frontmatter}\n\n${content}\n`);
  return { ok: true, stdout: `Stored in vault: ${path}`, stderr: "" };
}

export interface RecallOptions {
  type?: MemoryType;
  limit?: number;
  recent?: boolean;
}

interface ParsedNote {
  path: string;
  id: string;
  type: string;
  created: string;
  content: string;
}

function parseNote(path: string): ParsedNote | null {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!match) return null;

  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2];
  }

  return {
    path,
    id: fields.id ?? "",
    type: fields.type ?? "",
    created: fields.created ?? "",
    content: match[2].trim(),
  };
}

export function recallObsidian(cwd: string, query: string, options: RecallOptions = {}): ObsidianResult {
  const vault = vaultPath(cwd);
  if (!vault) return { ok: false, stdout: "", stderr: "PLUMB_OBSIDIAN_VAULT_PATH not set in config.env" };
  if (!existsSync(vault)) return { ok: false, stdout: "", stderr: `Vault path does not exist: ${vault}` };

  const namespace = namespaceFor(cwd);
  const typesRoot = join(vault, "Plumb", namespace, "memories");
  if (!existsSync(typesRoot)) return { ok: true, stdout: "No memories found for this project.", stderr: "" };

  const types = options.type ? [options.type] : (readdirSync(typesRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) as MemoryType[]);

  let notes: ParsedNote[] = [];
  for (const type of types) {
    const dir = join(typesRoot, type);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const note = parseNote(join(dir, file));
      if (note) notes.push(note);
    }
  }

  if (query && !options.recent) {
    const q = query.toLowerCase();
    notes = notes.filter((n) => n.content.toLowerCase().includes(q));
  }

  notes.sort((a, b) => b.created.localeCompare(a.created));
  if (options.limit) notes = notes.slice(0, options.limit);

  if (notes.length === 0) {
    return { ok: true, stdout: "No memories found matching your query.", stderr: "" };
  }

  const stdout = notes
    .map((n) => `- [${n.type}] ${n.content.split("\n")[0]} (${n.created})`)
    .join("\n");
  return { ok: true, stdout, stderr: "" };
}

/** Obsidian memory already lives in a vault the team can share however
 * they share vaults (sync, git, whatever) — "export" here just mirrors it
 * into .plumb/memory/ for parity with the Memanto backend's flow. */
export function exportObsidian(cwd: string): { ok: boolean; bundlePath: string | null; stderr: string } {
  const vault = vaultPath(cwd);
  if (!vault) return { ok: false, bundlePath: null, stderr: "PLUMB_OBSIDIAN_VAULT_PATH not set in config.env" };

  const namespace = namespaceFor(cwd);
  const source = join(vault, "Plumb", namespace, "memories");
  if (!existsSync(source)) return { ok: false, bundlePath: null, stderr: "No memories to export yet" };

  return { ok: true, bundlePath: source, stderr: "" };
}
