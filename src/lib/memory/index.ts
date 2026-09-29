import { readConfigValue } from "../config.js";
import {
  isMemantoAvailable,
  remember as memantoRemember,
  recall as memantoRecall,
  type MemantoResult,
} from "../memanto.js";
import {
  isObsidianAvailable,
  rememberObsidian,
  recallObsidian,
  type RememberOptions,
  type RecallOptions,
} from "./obsidianBackend.js";

export type { MemoryType } from "../memanto.js";
export type { RememberOptions, RecallOptions } from "./obsidianBackend.js";

export type MemoryBackendName = "memanto" | "obsidian";

export function getBackendName(cwd: string): MemoryBackendName {
  return readConfigValue(cwd, "PLUMB_MEMORY_BACKEND") === "obsidian" ? "obsidian" : "memanto";
}

export function isBackendAvailable(cwd: string): boolean {
  return getBackendName(cwd) === "obsidian" ? isObsidianAvailable(cwd) : isMemantoAvailable();
}

export function backendUnavailableMessage(cwd: string): string {
  if (getBackendName(cwd) === "obsidian") {
    return "PLUMB_OBSIDIAN_VAULT_PATH not set or doesn't exist. Run `plumb-init` or set it in .plumb/config.env.";
  }
  return "No PLUMB_MEMANTO_AGENT configured in .plumb/config.env. Run `plumb init` (or `plumb doctor --fix`) to create the project's Memanto agent.";
}

export function remember(cwd: string, content: string, options: RememberOptions): MemantoResult {
  if (getBackendName(cwd) === "obsidian") return rememberObsidian(cwd, content, options);

  const agentId = readConfigValue(cwd, "PLUMB_MEMANTO_AGENT");
  if (!agentId) return { ok: false, stdout: "", stderr: backendUnavailableMessage(cwd) };
  return memantoRemember(agentId, content, options);
}

export function recall(cwd: string, query: string, options: RecallOptions = {}): MemantoResult {
  if (getBackendName(cwd) === "obsidian") return recallObsidian(cwd, query, options);

  const agentId = readConfigValue(cwd, "PLUMB_MEMANTO_AGENT");
  if (!agentId) return { ok: false, stdout: "", stderr: backendUnavailableMessage(cwd) };
  return memantoRecall(agentId, query, options);
}
