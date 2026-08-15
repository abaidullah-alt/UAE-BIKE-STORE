import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  // Prisma 7 moved the connection URL out of schema.prisma — this is what
  // the Prisma CLI (generate, db push, migrate, studio) uses now.
  datasource: {
    url: env("DATABASE_URL"),
  },
});
