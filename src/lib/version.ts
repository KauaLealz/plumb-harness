import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_JSON_PATH = join(MODULE_DIR, "..", "..", "package.json");

export function getPlumbVersion(): string {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")) as { version: string };
  return pkg.version;
}
