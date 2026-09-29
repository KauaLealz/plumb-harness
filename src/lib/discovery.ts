import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface DiscoveryResult {
  language: string | null;
  packageManager: string | null;
  testFramework: string | null;
  hasDocker: boolean;
  hasCI: boolean;
  services: string[];
  gitRemote: string | null;
}

function readJsonSafe(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function detectPackageManager(cwd: string): string | null {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";
  if (existsSync(join(cwd, "poetry.lock"))) return "poetry";
  if (existsSync(join(cwd, "uv.lock"))) return "uv";
  return null;
}

function detectLanguageAndTestFramework(
  cwd: string,
): Pick<DiscoveryResult, "language" | "testFramework"> {
  const pkg = readJsonSafe(join(cwd, "package.json"));
  if (pkg) {
    const deps = {
      ...((pkg.dependencies as Record<string, string>) ?? {}),
      ...((pkg.devDependencies as Record<string, string>) ?? {}),
    };
    const hasTs = existsSync(join(cwd, "tsconfig.json")) || "typescript" in deps;
    const testFramework = "vitest" in deps
      ? "vitest"
      : "jest" in deps
        ? "jest"
        : "mocha" in deps
          ? "mocha"
          : null;
    return { language: hasTs ? "typescript" : "javascript", testFramework };
  }

  if (existsSync(join(cwd, "pyproject.toml")) || existsSync(join(cwd, "requirements.txt"))) {
    const manifest = existsSync(join(cwd, "pyproject.toml"))
      ? readFileSync(join(cwd, "pyproject.toml"), "utf8")
      : readFileSync(join(cwd, "requirements.txt"), "utf8");
    const testFramework = /pytest/.test(manifest) ? "pytest" : null;
    return { language: "python", testFramework };
  }

  if (existsSync(join(cwd, "go.mod"))) {
    return { language: "go", testFramework: "go test" };
  }

  if (existsSync(join(cwd, "pom.xml")) || readdirSync(cwd).some((f) => f === "build.gradle")) {
    return { language: "java", testFramework: null };
  }

  return { language: null, testFramework: null };
}

function detectServices(cwd: string): string[] {
  const composePath = ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"]
    .map((name) => join(cwd, name))
    .find((path) => existsSync(path));
  if (!composePath) return [];

  const content = readFileSync(composePath, "utf8").toLowerCase();
  const known = ["postgres", "mysql", "mariadb", "redis", "mongo", "rabbitmq", "kafka"];
  return known.filter((service) => content.includes(service));
}

function detectGitRemote(cwd: string): string | null {
  const configPath = join(cwd, ".git", "config");
  if (!existsSync(configPath)) return null;
  const match = readFileSync(configPath, "utf8").match(/url\s*=\s*(.+)/);
  return match ? match[1].trim() : null;
}

export function discover(cwd: string): DiscoveryResult {
  const { language, testFramework } = detectLanguageAndTestFramework(cwd);

  return {
    language,
    packageManager: detectPackageManager(cwd),
    testFramework,
    hasDocker: existsSync(join(cwd, "Dockerfile")) || existsSync(join(cwd, "docker-compose.yml")),
    hasCI: existsSync(join(cwd, ".github", "workflows")),
    services: detectServices(cwd),
    gitRemote: detectGitRemote(cwd),
  };
}
