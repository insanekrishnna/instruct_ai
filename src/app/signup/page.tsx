'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useMemo, useState } from 'react';

function buildCallbackUrl(from: string | null, callbackUrl: string | null): string {
  const candidate = callbackUrl ?? from ?? '/';
  if (!candidate) return '/';
  if (candidate.startsWith('/')) return candidate;
  return '/';
}

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { from?: string; callbackUrl?: string };
}) {
  const callbackUrl = buildCallbackUrl(searchParams?.from ?? null, searchParams?.callbackUrl ?? null);
  const loginHref = useMemo(() => `/login?from=${encodeURIComponent(callbackUrl)}`, [callbackUrl]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setFormError('All fields are required');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setFormError(data?.error || 'Sign up failed');
      setIsLoading(false);
      return;
    }

    const signInRes = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (!signInRes || signInRes.error) {
      window.location.href = loginHref;
      return;
    }

    window.location.href = signInRes.url ?? callbackUrl;
  };

  return (
    <main className="min-h-screen bg-[#fff]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-[0_18px_56px_rgba(48,56,52,0.07)] backdrop-blur-xl">
          <Image
            src="/images/instruct/capmax-removebg-preview.png"
            alt="Capmax"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-sm font-medium text-[#2f3638]">Capmax AI</span>
        </div>

        <h1
          className="text-balance text-[clamp(2rem,6vw,3.2rem)] leading-[1.0] tracking-[-0.05em] text-[#000]"
          style={{ fontFamily: 'var(--font-editorial), serif', fontWeight: 600 }}
        >
          Create your account
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-[#657985] md:text-base">
          Get 2 free generations immediately. Upgrade anytime.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 w-full max-w-md rounded-[28px] border border-white/70 bg-white/70 p-5 text-left shadow-[0_18px_56px_rgba(48,56,52,0.07)] backdrop-blur-xl"
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#4e565d]">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#1e1d1d] outline-none ring-0 focus:border-black/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4e565d]">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#1e1d1d] outline-none ring-0 focus:border-black/20"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#4e565d]">Confirm password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#1e1d1d] outline-none ring-0 focus:border-black/20"
                placeholder="Repeat password"
              />
            </div>

            {formError && <p className="text-sm font-medium text-red-700">{formError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 inline-flex w-full items-center justify-center rounded-full border border-white/60 bg-black px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_56px_rgba(0,0,0,0.18)] transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating…' : 'Create account'}
            </button>

            <p className="text-center text-xs text-[#6f7778]">
              Already have an account?{' '}
              <Link href={loginHref} className="font-semibold text-[#2f3638] underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

