'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
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
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Instruct
            </span>
          </Link>

          {/* Auth Buttons Section */}
          <div className="flex items-center gap-3 sm:gap-4">
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
          </div>
        </nav>
      </div>
    </header>
  );
}
