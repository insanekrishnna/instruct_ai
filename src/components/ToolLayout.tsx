'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/instruct/capmax-removebg-preview.png"
                alt="Capmax logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
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

              {/* User Info and Logout */}
              {session?.user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name || session.user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
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
            (c) 2026 Capmax AI
          </p>
        </div>
      </footer>
    </div>
  );
}
