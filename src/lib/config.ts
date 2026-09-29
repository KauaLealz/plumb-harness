import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function configPath(cwd: string): string {
  return join(cwd, ".plumb", "config.env");
}

export function readConfigValue(cwd: string, key: string): string | null {
  const path = configPath(cwd);
  if (!existsSync(path)) return null;

  const content = readFileSync(path, "utf8");
  const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : null;
}

/** Sets a single KEY=value line in config.env, leaving every other line
 * (including comments and ordering) untouched. */
export function writeConfigValue(cwd: string, key: string, value: string): void {
  const path = configPath(cwd);
  if (!existsSync(path)) {
    throw new Error(`${path} does not exist. Run \`plumb scaffold\` first.`);
  }

  const content = readFileSync(path, "utf8");
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const updated = pattern.test(content)
    ? content.replace(pattern, `${key}=${value}`)
    : `${content.trimEnd()}\n${key}=${value}\n`;

  writeFileSync(path, updated);
}
