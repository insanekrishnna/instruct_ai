'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/lib/hooks';
import type { Niche } from '@/lib/types';

interface NicheSetupProps {
  onComplete?: () => void;
}

const NICHES: { value: Niche; label: string }[] = [
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'food', label: '🍕 Food' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'startup', label: '🚀 Startup' },
  { value: 'fashion', label: '👗 Fashion' },
  { value: 'other', label: '✨ Other' },
];

export function NicheSetup({ onComplete }: NicheSetupProps) {
  const { profile, saveProfile } = useUserProfile();
  const [name, setName] = useState('');
  const [niche, setNiche] = useState<Niche>('startup');
  const [tonePreference, setTonePreference] = useState('');
  const [isEditing, setIsEditing] = useState(!profile);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setNiche(profile.niche);
      setTonePreference(profile.tonePreference);
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name, niche, tonePreference });
    setIsEditing(false);
    onComplete?.();
  };

  if (!isEditing && profile) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Creator Profile</h3>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">{profile.name}</span> • {NICHES.find((n) => n.value === profile.niche)?.label}
              {profile.tonePreference && ` • ${profile.tonePreference}`}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-200"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Set Up Your Creator Profile</h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sarah Khan"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Your Niche *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {NICHES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setNiche(option.value)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  niche === option.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tone Preference (Optional)
          </label>
          <input
            type="text"
            value={tonePreference}
            onChange={(e) => setTonePreference(e.target.value)}
            placeholder="e.g., Witty, professional, casual..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
