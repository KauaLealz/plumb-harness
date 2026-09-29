import { readFileSync } from "node:fs";

export function readStdinJson<T>(): T {
  const raw = readFileSync(0, "utf8");
  return JSON.parse(raw) as T;
}
