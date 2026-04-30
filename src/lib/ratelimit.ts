import { Redis } from '@upstash/redis';
import type { Plan } from '@prisma/client';

const DAILY_LIMIT = 5;
const FREE_LIFETIME_LIMIT = 2;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function todayKey(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function keyFor(userId: string, plan: Plan): { key: string; limit: number; ttlSeconds?: number } {
  if (plan === 'FREE') {
    return { key: `credits:${userId}:lifetime`, limit: FREE_LIFETIME_LIMIT };
  }
  return { key: `credits:${userId}:${todayKey()}`, limit: DAILY_LIMIT, ttlSeconds: 24 * 60 * 60 };
}

async function getCount(key: string): Promise<number> {
  const value = await redis.get<number | string | null>(key);
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function checkRateLimit(
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; remaining: number }> {
  const { key, limit } = keyFor(userId, plan);
  const count = await getCount(key);
  const remaining = Math.max(limit - count, 0);
  return { allowed: remaining > 0, remaining };
}

export async function consumeRateLimit(
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; remaining: number }> {
  const { key, limit, ttlSeconds } = keyFor(userId, plan);
  const count = await redis.incr(key);
  if (ttlSeconds) {
    // Ensure daily keys roll over without manual cleanup.
    await redis.expire(key, ttlSeconds);
  }
  const remaining = Math.max(limit - count, 0);
  return { allowed: remaining >= 0 && count <= limit, remaining };
}

