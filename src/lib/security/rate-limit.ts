import { prisma } from "@/lib/db";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

// ── In-memory fallback ────────────────────────────────────────────────────────
// Per-isolate only (not distributed). Used for tests, for local/dev without a
// database, and as the fail-open path when the DB check throws.

type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export function resetRateLimitStoreForTests() {
  store.clear();
}

export function getRateLimitStoreSizeForTests() {
  return store.size;
}

export function checkRateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  let bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length === 0) {
    store.delete(key);
    bucket = { timestamps: [] };
  }

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    store.set(key, bucket);
    return { ok: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return { ok: true };
}

// ── Postgres-backed distributed limiter (fixed window) ────────────────────────
// Shared across serverless isolates so limits survive multi-instance /
// cold-start bypass. One atomic upsert per check (race-safe); the window
// self-resets once `expiresAt` passes.

// Keys such as `login:${ip}:${email}` have unbounded cardinality, so the upsert
// alone never reclaims old rows. Sweep expired rows on ~1% of checks.
async function sweepExpired(): Promise<void> {
  try {
    await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "expiresAt" < now()`;
  } catch {
    // best-effort; ignore
  }
}

async function checkRateLimitInDb(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const expiresAt = new Date(Date.now() + windowMs);

  // Increment-then-read: allow up to `limit` (block when count exceeds it).
  const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count"     = CASE WHEN "RateLimit"."expiresAt" < now() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < now() THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END
    RETURNING "count", "expiresAt"
  `;

  if (Math.random() < 0.01) void sweepExpired();

  const row = rows[0];
  if (!row) return { ok: true };

  const count = Number(row.count);
  if (count > limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((new Date(row.expiresAt).getTime() - Date.now()) / 1000),
    );
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

/**
 * Rate-limit `key` to `limit` requests per `windowMs`.
 *
 * Uses the shared Postgres counter when a database is configured; on any DB
 * error it falls back to the per-isolate in-memory limiter. This is fail-open
 * by design — a limiter that fails closed would block every request during a
 * DB outage. Consequence: without a reachable DB the distributed guarantee is
 * lost and limiting degrades to per-isolate.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!process.env.DATABASE_URL) {
    return checkRateLimitInMemory(key, limit, windowMs);
  }
  try {
    return await checkRateLimitInDb(key, limit, windowMs);
  } catch (err) {
    console.error("[rate-limit] DB check failed; falling back to in-memory:", err);
    return checkRateLimitInMemory(key, limit, windowMs);
  }
}
