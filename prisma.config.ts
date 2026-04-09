import { defineConfig } from "prisma/config";
import { loadProjectEnv, resolveEnvMode } from "./lib/env";

loadProjectEnv(resolveEnvMode());

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Prisma supports this at runtime, but the current config typing in this project does not include it yet.
  // @ts-expect-error Prisma seed is intentionally configured here.
  seed: "tsx prisma/seed.ts",
});
