import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires a driver adapter at runtime (the `url` field in
// schema.prisma no longer works — see prisma.config.ts for the CLI side
// of this same change). PrismaPg wraps the standard `pg` driver.
//
// Pool settings tuned for Neon's serverless Postgres: Neon aggressively
// closes idle connections, which otherwise surfaces as intermittent
// "Server has closed the connection" / JWTSessionError crashes under
// completely normal browsing. Keeping the pool small and connections
// short-lived means we reconnect cleanly instead of reusing a connection
// Neon has already dropped on its end.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

// Prevents creating a new PrismaClient on every hot-reload in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
