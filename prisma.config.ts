import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI config (replaces deprecated package.json#prisma).
 * @see https://pris.ly/prisma-config
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
