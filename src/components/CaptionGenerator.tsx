'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Upload, X } from 'lucide-react';
import { useUserProfile, generateContent } from '@/lib/hooks';
import { CopyButton, LoadingSkeleton, Toast } from './ui/Toast';
import type { CaptionStyle } from '@/lib/types';
import { PlatformSelector, type Platform } from './PlatformSelector';

const STYLES: CaptionStyle[] = ['Aggressive', 'Ragebait', 'Emotional', 'Funny', 'Normal'];

export function CaptionGenerator() {
  const { profile } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [style, setStyle] = useState<CaptionStyle>('Normal');
  const [wordLimit, setWordLimit] = useState(100);
  const [hinglish, setHinglish] = useState(false);
  const [abVariant, setAbVariant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState<string | string[] | null>(null);
  const [engagementScore, setEngagementScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = (event: any) => {
      setError(`Voice error: ${event.error}`);
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a caption idea');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEngagementScore(null);

    try {
      const result = await generateContent('caption', prompt, {
        style,
        wordLimit,
        hinglish,
        abVariant,
        imageBase64: imageBase64 ? imageBase64 : undefined,
        userProfile: profile,
      });

      setGenerated(result.content);
      setEngagementScore(result.engagementScore || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast('Copied to clipboard!');
  };

  const handleEditCaption = (index: number, newText: string) => {
    if (Array.isArray(generated)) {
      const updated = [...generated];
      updated[index] = newText;
      setGenerated(updated);
    } else {
      setGenerated(newText);
    }
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast} />}

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caption Idea
            </label>
            <div className="flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your caption idea, topic, or vibe..."
                rows={4}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Voice Input Button */}
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors disabled:opacity-50"
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  Listening...
                </>
              ) : (
                <>
                  <Mic size={18} />
                  Use Voice
                </>
              )}
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image (Optional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              {imageBase64 ? (
                <div className="relative inline-block">
                  <img src={imageBase64} alt="Uploaded" className="h-24 w-24 object-cover rounded-lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageBase64(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">Click to upload image</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caption Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    style === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Word Limit Selector */}
          <PlatformSelector
            platform={platform}
            setPlatform={setPlatform}
            wordLimit={wordLimit}
            setWordLimit={setWordLimit}
          />

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hinglish}
                onChange={(e) => setHinglish(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hinglish Mode</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={abVariant}
                onChange={(e) => setAbVariant(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">A/B Variants</span>
            </label>
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
            disabled={isLoading || !prompt.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Caption'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {isLoading && <LoadingSkeleton />}

      {generated && !isLoading && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generated Caption{Array.isArray(generated) && 's'}</h2>

          {engagementScore !== null && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                Engagement Score: <span className="text-2xl font-bold">{engagementScore}</span>/100
              </p>
            </div>
          )}

          <div className="space-y-4">
            {Array.isArray(generated) ? (
              generated.map((caption, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Version {String.fromCharCode(65 + index)}
                  </h3>

                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <textarea
                        value={caption}
                        onChange={(e) => handleEditCaption(index, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{caption}</p>
                      <div className="flex gap-2">
                        <CopyButton text={caption} />
                        <button
                          onClick={() => setEditingIndex(index)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {editingIndex === 0 ? (
                  <div className="space-y-2">
                    <textarea
                      value={generated}
                      onChange={(e) => handleEditCaption(0, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{generated}</p>
                    <div className="flex gap-2">
                      <CopyButton text={generated} />
                      <button
                        onClick={() => setEditingIndex(0)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
