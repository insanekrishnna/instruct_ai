'use client';

import { Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
}

export function Toast({ message, duration = 2000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timeoutId);
  }, [duration, message]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
      {message}
    </div>
  );
}

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        // Avoid scrolling to bottom
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('Fallback copy command was unsuccessful');
          }
        } catch (err) {
          console.error('Fallback copy failed', err);
          throw err;
        } finally {
          document.body.removeChild(textarea);
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const message = err instanceof Error ? err.message : 'Unknown copy error';
      alert('Failed to copy text: ' + message);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <Check size={18} className="text-green-500" />
          <span className="text-sm font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy size={18} />
          <span className="text-sm font-medium">Copy</span>
        </>
      )}
    </button>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
    </div>
  );
}
