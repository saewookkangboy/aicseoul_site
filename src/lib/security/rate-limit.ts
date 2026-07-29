type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export function resetRateLimitStoreForTests() {
  store.clear();
}

export function getRateLimitStoreSizeForTests() {
  return store.size;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
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
