'use client';

import { useCallback, useRef } from 'react';

/**
 * Client-side rate limiting hook to prevent rapid repeated requests
 * @param delayMs Minimum milliseconds between requests (default: 2000ms)
 * @returns Object with canMakeRequest() and getTimeUntilReady()
 */
export function useRateLimit(delayMs: number = 2000) {
  const lastRequestTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    return timeSinceLastRequest >= delayMs;
  }, [delayMs]);

  const getTimeUntilReady = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    const remaining = Math.max(0, delayMs - timeSinceLastRequest);
    return remaining;
  }, [delayMs]);

  const recordRequest = useCallback(() => {
    lastRequestTime.current = Date.now();
  }, []);

  const reset = useCallback(() => {
    lastRequestTime.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    canMakeRequest,
    getTimeUntilReady,
    recordRequest,
    reset,
  };
}
