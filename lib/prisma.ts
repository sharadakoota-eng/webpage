import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv, resolveEnvMode } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const moduleDir = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)).replace(/^\/([A-Za-z]:)/, "$1");
const projectRoot = path.resolve(moduleDir, "..");
const envMode = resolveEnvMode(process.env.NODE_ENV);
const envFileName = envMode === "production" ? ".env.production" : ".env.local";
if (fs.existsSync(path.join(projectRoot, envFileName))) {
  loadProjectEnv(envMode);
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
