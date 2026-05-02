'use client';

import { useState } from 'react';
import { useUserProfile, generateContent } from '@/lib/hooks';
import { CopyButton, LoadingSkeleton, Toast } from './ui/Toast';
import type { ThreadType } from '@/lib/types';

export function ThreadGenerator() {
  const { profile } = useUserProfile();

  const [topic, setTopic] = useState('');
  const [threadType, setThreadType] = useState<ThreadType>('Twitter thread');
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [items, setItems] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateContent('thread', topic, {
        threadType,
        userProfile: profile,
      });

      const content = typeof result.content === 'string' ? result.content : result.content[0];
      setScript(content);

      // Parse items for display
      if (threadType === 'Twitter thread') {
        const parsed = content
          .split('\n')
          .filter((line: string) => line.trim().match(/^\d+\//))
          .map((line: string) => line.replace(/^\d+\/\s*/, '').trim());
        setItems(parsed.length > 0 ? parsed : [content]);
      } else {
        // Carousel slides
        const slides = content.split(/📌\s*SLIDE\s*\d+/).filter((s: string) => s.trim());
        setItems(slides.length > 0 ? slides.map((s: string) => s.trim()) : [content]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
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
              Topic / Concept *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 5 mistakes founders make, productivity hacks..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Thread Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Format *
            </label>
            <div className="flex gap-2">
              {(['Twitter thread', 'Instagram carousel'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setThreadType(type)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    threadType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {type}
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
            {isLoading ? 'Generating Script...' : `Generate ${threadType}`}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {isLoading && <LoadingSkeleton />}

      {script && !isLoading && (
        <div className="space-y-6">
          {/* Full Script Copy */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Full {threadType}</h2>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {script}
              </pre>
            </div>

            <CopyButton text={script} className="w-full justify-center" />
          </div>

          {/* Individual Items */}
          {items && items.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {threadType === 'Twitter thread' ? 'Individual Tweets' : 'Slides'}
              </h3>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {threadType === 'Twitter thread' ? `Tweet ${index + 1}` : `Slide ${index + 1}`}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{item}</p>
                    <CopyButton text={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
