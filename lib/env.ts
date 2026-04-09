import fs from "node:fs";
import path from "node:path";

export type EnvMode = "local" | "production";

function parseEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export function resolveEnvMode(explicitMode?: string | null): EnvMode {
  const value = (explicitMode ?? process.env.ERP_ENV ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "").toLowerCase();

  if (value === "production" || value === "prod" || value === "live") {
    return "production";
  }

  return "local";
}

export function loadProjectEnv(mode?: EnvMode) {
  const resolvedMode = mode ?? resolveEnvMode();
  const projectRoot = process.cwd();
  const fileName = resolvedMode === "production" ? ".env.production" : ".env.local";
  parseEnvFile(path.join(projectRoot, fileName));
  return resolvedMode;
}
