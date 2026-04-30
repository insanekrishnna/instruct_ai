'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useMemo, useState } from 'react';

function buildCallbackUrl(from: string | null, callbackUrl: string | null): string {
  const candidate = callbackUrl ?? from ?? '/';
  if (!candidate) return '/';
  // Avoid open redirects; only allow same-origin relative paths.
  if (candidate.startsWith('/')) return candidate;
  return '/';
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { from?: string; callbackUrl?: string };
}) {
  const callbackUrl = buildCallbackUrl(searchParams?.from ?? null, searchParams?.callbackUrl ?? null);
  const signupHref = useMemo(() => `/signup?from=${encodeURIComponent(callbackUrl)}`, [callbackUrl]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (!res || res.error) {
      setFormError('Invalid email or password');
      setIsLoading(false);
      return;
    }

    window.location.href = res.url ?? callbackUrl;
  };

  const onGoogle = async () => {
    await signIn('google', { callbackUrl });
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
          Sign in to generate posts
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-[#657985] md:text-base">
          Continue with Google to unlock your FREE credits and save your last 3 generations.
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
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-[#1e1d1d] outline-none ring-0 focus:border-black/20"
                placeholder="••••••••"
              />
            </div>

            {formError && <p className="text-sm font-medium text-red-700">{formError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 inline-flex w-full items-center justify-center rounded-full border border-white/60 bg-black px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_56px_rgba(0,0,0,0.18)] transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-center text-xs text-[#6f7778]">
              Don&apos;t have an account?{' '}
              <Link href={signupHref} className="font-semibold text-[#2f3638] underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6 flex w-full max-w-md items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs font-semibold text-[#6f7778]">OR</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <button
          type="button"
          onClick={() => void onGoogle()}
          className="mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm font-semibold text-[#1e1d1d] shadow-[0_18px_56px_rgba(48,56,52,0.09)] backdrop-blur-xl transition hover:bg-white/80"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
            <span className="text-base font-bold">G</span>
          </span>
          Continue with Google
        </button>

        <p className="mt-4 text-xs text-[#6f7778]">
          You’ll be redirected back to <span className="font-semibold text-[#2f3638]">{callbackUrl}</span>.
        </p>
      </div>
    </main>
  );
}

