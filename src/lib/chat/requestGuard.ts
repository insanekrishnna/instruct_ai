import { CHAT_LIMITS } from './config';

type GuardEntry<T> = {
  promise: Promise<T>;
  createdAt: number;
};

const inFlight = new Map<string, GuardEntry<unknown>>();
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function cleanup(now: number) {
  for (const [key, entry] of inFlight.entries()) {
    if (now - entry.createdAt > CHAT_LIMITS.requestGuardTtlMs) {
      inFlight.delete(key);
    }
  }

  for (const [key, entry] of requestCounts.entries()) {
    if (now - entry.timestamp > CHAT_LIMITS.requestGuardTtlMs) {
      requestCounts.delete(key);
    }
  }
}

export function trackRequestCount(userId: string, actionId: string) {
  const now = Date.now();
  cleanup(now);
  const key = `${userId}:${actionId}`;
  const current = requestCounts.get(key);
  const count = (current?.count ?? 0) + 1;
  requestCounts.set(key, { count, timestamp: now });
  return count;
}

export function getDuplicatePromise<T>(key: string) {
  cleanup(Date.now());
  return inFlight.get(key)?.promise as Promise<T> | undefined;
}

export function setInFlight<T>(key: string, promise: Promise<T>) {
  cleanup(Date.now());
  inFlight.set(key, { promise, createdAt: Date.now() });
}

export function clearInFlight(key: string) {
  inFlight.delete(key);
}

export function buildRequestFingerprint(userId: string, messages: unknown) {
  return JSON.stringify({ userId, messages });
}
