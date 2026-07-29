import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Serverless-friendly datasource URL:
 * - connection_limit=1 per isolate (avoids holding many session slots)
 * - if using Supabase pooler on :6543, ensure pgbouncer=true
 */
function datasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  let url = raw;
  if (!/[?&]connection_limit=/.test(url)) {
    url += url.includes("?") ? "&connection_limit=1" : "?connection_limit=1";
  }
  if (/:6543\b/.test(url) && !/[?&]pgbouncer=true/.test(url)) {
    url += "&pgbouncer=true";
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: datasourceUrl()
      ? { db: { url: datasourceUrl() } }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
