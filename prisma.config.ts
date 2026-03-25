import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

function loadEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [keyPart, ...valueParts] = line.split("=");
    const key = keyPart.trim();
    let value = valueParts.join("=").trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Prisma supports this at runtime, but the current config typing in this project does not include it yet.
  // @ts-expect-error Prisma seed is intentionally configured here.
  seed: "tsx prisma/seed.ts",
});
