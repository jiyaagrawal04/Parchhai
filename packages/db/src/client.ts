import { PrismaClient } from "@prisma/client";

// Standard PostgreSQL connection — works with Supabase, Neon, or any Postgres.
// Prisma reads DATABASE_URL (and DIRECT_URL for migrations) from the datasource
// block in schema.prisma.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env and fill it in.");
}

const createClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Reuse a single client across hot-reloads in dev to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
