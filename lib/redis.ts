import { Redis } from "@upstash/redis";

// ponytail: no-op cache when env vars absent, so local/dev without Upstash still works
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Wraps any async fetcher with a Redis-backed cache. Use in API routes for read-heavy Supabase queries.
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) return fetcher();

  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttlSeconds });
  return fresh;
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  await redis.del(key);
}
