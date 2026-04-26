'use client';

import { useState } from 'react';
import { useUserProfile, generateContent } from '@/lib/hooks';
import { CopyButton, LoadingSkeleton, Toast } from './ui/Toast';
import type { Platform } from '@/lib/types';

export function HookGenerator() {
  const { profile } = useUserProfile();

  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [isLoading, setIsLoading] = useState(false);
  const [hooks, setHooks] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or niche');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateContent('hook', topic, {
        platform,
        niche: niche || profile?.niche,
        userProfile: profile,
      });

      // Parse the hooks from the response
      const hooksText = typeof result.content === 'string' ? result.content : result.content[0];
      const parsedHooks = hooksText
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((line: string) => line.length > 0);

      setHooks(parsedHooks.length > 0 ? parsedHooks : [hooksText]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate hooks');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast} />}

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic / Content Idea *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., productivity, fitness routines, travel tips..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Niche Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Niche (Optional)
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={`Leave blank to use: ${profile?.niche || 'your profile niche'}`}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Instagram', 'Twitter', 'LinkedIn'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    platform === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Generating Hooks...' : 'Generate 8 Hooks'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {isLoading && <LoadingSkeleton />}

      {hooks && !isLoading && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generated Hooks for {platform}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hooks.map((hook, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                <p className="text-gray-700 dark:text-gray-300 mb-3">{hook}</p>
                <CopyButton text={hook} className="w-full justify-center" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
