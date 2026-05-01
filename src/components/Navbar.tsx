'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl">
        {/* Floating Header */}
        <nav className="flex items-center justify-between rounded-2xl border border-blue-200/30 bg-gradient-to-b from-white/70 to-white/40 px-6 sm:px-8 py-3 backdrop-blur-xl shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:border-blue-200/50 hover:from-white/80 hover:to-white/50">
          
          {/* Logo Section */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <Image
              src="/images/instruct/capmax-removebg-preview.png"
              alt="Capmax logo"
              width={56}
              height={56}
              className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14"
            />
            <span className="hidden sm:inline text-base font-semibold text-slate-900 transition-colors group-hover:text-slate-700">
              Capmax
            </span>
          </Link>

          {/* Auth Buttons Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {status === 'loading' ? (
              // Loading state
              <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
            ) : session?.user ? (
              // Logged in state
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-slate-900">
                    {session.user.name || session.user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-400 active:scale-95 border border-blue-400/20 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                  <LogOut size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                </button>
              </div>
            ) : (
              // Not logged in state
              <>
                {/* Log in Button */}
                <Link 
                  href="/login" 
                  className="px-4 sm:px-5 py-2 text-sm font-medium text-slate-700 transition-all duration-300 relative group overflow-hidden"
                >
                  <span className="relative z-10 group-hover:text-blue-600">Log in</span>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300" />
                </Link>

                {/* Sign up Button */}
                <Link 
                  href="/signup"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-400 active:scale-95 border border-blue-400/20 group"
                >
                  <span>Sign up</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
