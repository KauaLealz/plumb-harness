import { spawnSync } from "node:child_process";

export type MemoryType =
  | "fact"
  | "preference"
  | "goal"
  | "decision"
  | "artifact"
  | "learning"
  | "event"
  | "instruction"
  | "relationship"
  | "context"
  | "observation"
  | "commitment"
  | "error";

export interface MemantoResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function run(args: string[]): MemantoResult {
  const result = spawnSync("memanto", args, { encoding: "utf8" });
  if (result.error) {
    return { ok: false, stdout: "", stderr: `memanto not available: ${result.error.message}` };
  }
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

export function isMemantoAvailable(): boolean {
  return run(["--version"]).ok;
}

/** Creates the project's Memanto agent (pattern: project) and activates it. */
export function createProjectAgent(agentId: string, description: string): MemantoResult {
  return run(["agent", "create", agentId, "--pattern", "project", "--description", description]);
}

/** Memanto's active agent is a global, machine-wide session (see plan risk
 * table): always activate the right one right before any call that
 * depends on it, never assume it's still active from a previous call. */
export function activateAgent(agentId: string): MemantoResult {
  return run(["agent", "activate", agentId]);
}

export interface RememberOptions {
  type: MemoryType;
  tags?: string[];
}

export function remember(agentId: string, content: string, options: RememberOptions): MemantoResult {
  const activation = activateAgent(agentId);
  if (!activation.ok) return activation;

  const args = ["remember", content, "--type", options.type];
  if (options.tags && options.tags.length > 0) {
    args.push("--tags", options.tags.join(","));
  }
  return run(args);
}

export interface RecallOptions {
  type?: MemoryType;
  limit?: number;
  recent?: boolean;
}

export function recall(agentId: string, query: string, options: RecallOptions = {}): MemantoResult {
  const activation = activateAgent(agentId);
  if (!activation.ok) return activation;

  const args = ["recall"];
  if (options.recent) {
    args.push("--recent");
  } else {
    args.push(query);
  }
  if (options.type) args.push("--type", options.type);
  if (options.limit) args.push("--limit", String(options.limit));
  args.push("--active");
  return run(args);
}
