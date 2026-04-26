'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Home } from 'lucide-react';
import { useState } from 'react';

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const TOOLS = [
  { name: 'Caption', href: '/generate', icon: '✨' },
  { name: 'Hooks', href: '/hook', icon: '🎣' },
  { name: 'Repurpose', href: '/repurpose', icon: '♻️' },
  { name: 'Thread', href: '/thread', icon: '🧵' },
];

export function ToolLayout({ children, title, description }: ToolLayoutProps) {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Instruct
            </Link>
            <nav className="hidden sm:flex items-center gap-8">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === tool.href
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tool.icon} {tool.name}
                </Link>
              ))}
              <Link href="/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg">
                <Settings size={20} className="text-gray-600 dark:text-gray-300" />
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              onClick={() => setShowNav(!showNav)}
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile nav */}
          {showNav && (
            <nav className="sm:hidden flex flex-col gap-2 pb-4">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === tool.href
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {tool.icon} {tool.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{description}</p>
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
            © 2026 Instruct - Viral Content Generator
          </p>
        </div>
      </footer>
    </div>
  );
}
