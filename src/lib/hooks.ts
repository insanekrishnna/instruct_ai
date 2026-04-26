'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, Niche } from '@/lib/types';

const PROFILE_STORAGE_KEY = 'viral-caption-user-profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse profile:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
  };

  const hasProfile = () => profile !== null;

  return { profile, isLoading, saveProfile, hasProfile };
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  const showToast = (message: string, duration = 2000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return { toasts, showToast };
}

export async function generateContent(
  feature: string,
  prompt: string,
  options: any = {}
) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature,
      prompt,
      ...options,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate content');
  }

  return response.json();
}
