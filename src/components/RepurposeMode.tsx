'use client';

import { useState } from 'react';
import { useUserProfile, generateContent } from '@/lib/hooks';
import { CopyButton, LoadingSkeleton, Toast } from './ui/Toast';
import type { OutputFormat } from '@/lib/types';

const OUTPUT_FORMATS: OutputFormat[] = ['Instagram caption', 'Twitter thread', 'LinkedIn post', 'Carousel script'];

export function RepurposeMode() {
  const { profile } = useUserProfile();

  const [content, setContent] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('Instagram caption');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please paste the content you want to repurpose');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateContent('repurpose', content, {
        outputFormat,
        userProfile: profile,
      });

      setResult(typeof result.content === 'string' ? result.content : result.content[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to repurpose content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast} />}

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="space-y-6">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Content *
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Paste a tweet thread, LinkedIn post, article, or any long-form content
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Repurpose As *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OUTPUT_FORMATS.map((format) => (
                <button
                  key={format}
                  onClick={() => setOutputFormat(format)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all text-left ${
                    outputFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {format}
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
            disabled={isLoading || !content.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Repurposing...' : 'Repurpose Content'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {isLoading && <LoadingSkeleton />}

      {result && !isLoading && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Repurposed as {outputFormat}
          </h2>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{result}</p>
          </div>

          <CopyButton text={result} className="w-full justify-center" />
        </div>
      )}
    </div>
  );
}
