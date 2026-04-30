'use client';

import { Briefcase, Camera } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type Platform = 'instagram' | 'twitter' | 'linkedin';

type PlatformSelectorProps = {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  wordLimit: number;
  setWordLimit: (limit: number) => void;
};

type PlatformConfig = {
  label: string;
  description: string;
  hint: string;
  defaultLimit: number;
  limits: number[];
  min: number;
  max: number;
};

const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    label: 'Instagram',
    description: 'Short & punchy - perfect for Reels',
    hint: 'Hashtags + emoji friendly \u2726',
    defaultLimit: 20,
    limits: [10, 15, 20, 30, 40, 50],
    min: 10,
    max: 50,
  },
  twitter: {
    label: 'Twitter/X',
    description: 'Keep it sharp - Twitter loves brevity',
    hint: 'No hashtag spam \u00b7 max 2-3 tags \u2726',
    defaultLimit: 30,
    limits: [10, 20, 30, 40, 50],
    min: 10,
    max: 50,
  },
  linkedin: {
    label: 'LinkedIn',
    description: 'Longer works here - LinkedIn rewards depth',
    hint: 'Professional tone \u00b7 3-5 hashtags \u2726',
    defaultLimit: 100,
    limits: [50, 75, 100, 125, 150, 175, 200],
    min: 50,
    max: 200,
  },
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4L19 20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 4L5 20" />
    </svg>
  );
}

function getDefaultLimit(platform: Platform) {
  return PLATFORM_CONFIG[platform].defaultLimit;
}

function getClosestIndex(limits: number[], value: number) {
  const exactIndex = limits.indexOf(value);

  if (exactIndex >= 0) {
    return exactIndex;
  }

  return limits.reduce((closestIndex, limit, index) => {
    const currentDistance = Math.abs(limit - value);
    const bestDistance = Math.abs(limits[closestIndex] - value);
    return currentDistance < bestDistance ? index : closestIndex;
  }, 0);
}

export function PlatformSelector({
  platform,
  setPlatform,
  wordLimit,
  setWordLimit,
}: PlatformSelectorProps) {
  const config = PLATFORM_CONFIG[platform];
  const [sliderIndex, setSliderIndex] = useState(() => getClosestIndex(config.limits, wordLimit));

  useEffect(() => {
    setSliderIndex(getClosestIndex(config.limits, wordLimit));
  }, [config.limits, wordLimit]);

  const characterEstimate = useMemo(() => {
    if (platform !== 'twitter') {
      return null;
    }

    return wordLimit * 5;
  }, [platform, wordLimit]);

  const tabs = useMemo(
    () => [
      { key: 'instagram' as const, label: 'Instagram', icon: Camera },
      { key: 'twitter' as const, label: 'Twitter/X', icon: XIcon },
      { key: 'linkedin' as const, label: 'LinkedIn', icon: Briefcase },
    ],
    []
  );

  const handlePlatformChange = (nextPlatform: Platform) => {
    const nextDefault = getDefaultLimit(nextPlatform);
    const nextIndex = getClosestIndex(PLATFORM_CONFIG[nextPlatform].limits, nextDefault);

    setPlatform(nextPlatform);
    setSliderIndex(nextIndex);
    setWordLimit(nextDefault);
  };

  const handleSliderChange = (value: string) => {
    const nextIndex = Number(value);
    const nextLimit = config.limits[nextIndex];

    setSliderIndex(nextIndex);
    setWordLimit(nextLimit);
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 sm:p-5">
      <div className="rounded-2xl border border-white/20 bg-black/10 p-1 shadow-sm backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = platform === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePlatformChange(key)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'border-white/20 bg-white/20 text-white shadow-md backdrop-blur-xl'
                    : 'border-transparent bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/20 bg-black/10 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Word Limit: {wordLimit}</p>
            <p className="text-xs text-white/70">{config.description}</p>
          </div>
          <p className="text-xs text-white/55">
            {config.min}-{config.max} words
          </p>
        </div>

        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={config.limits.length - 1}
            step={1}
            value={sliderIndex}
            onChange={(event) => handleSliderChange(event.target.value)}
            className="h-2 w-full cursor-pointer appearance-none rounded-full border border-white/20 bg-white/10 accent-white/90"
            aria-label={`${config.label} word limit`}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {config.limits.map((limit) => {
              const isActive = wordLimit === limit;

              return (
                <button
                  key={limit}
                  type="button"
                  onClick={() => {
                    setSliderIndex(getClosestIndex(config.limits, limit));
                    setWordLimit(limit);
                  }}
                  className={`rounded-2xl border px-3 py-1 text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? 'border-white/20 bg-white/20 text-white shadow-sm backdrop-blur-xl'
                      : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
                  }`}
                >
                  {limit}
                </button>
              );
            })}
          </div>

          {platform === 'twitter' && characterEstimate !== null && (
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <span className="text-white/70">Estimated length: ~{characterEstimate} chars</span>
              <span className={characterEstimate > 280 ? 'text-red-300' : 'text-white/60'}>
                {characterEstimate > 280 ? 'May exceed 280 characters' : 'Fits typical tweet length'}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 shadow-sm backdrop-blur-xl">
          {config.hint}
        </div>
      </div>
    </div>
  );
}
