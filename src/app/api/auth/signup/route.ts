import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, 'INVALID_INPUT', 'Invalid JSON body');
  }

  const maybeBody = body as { email?: unknown; password?: unknown; confirmPassword?: unknown };
  const emailRaw = maybeBody?.email;
  const password = maybeBody?.password;
  const confirmPassword = maybeBody?.confirmPassword;

  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
  if (!email || !password || !confirmPassword) {
    return error(400, 'INVALID_INPUT', 'All fields are required');
  }
  if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return error(400, 'INVALID_INPUT', 'Invalid input');
  }
  if (!isValidEmail(email)) {
    return error(400, 'INVALID_INPUT', 'Enter a valid email');
  }
  if (password.length < 8) {
    return error(400, 'INVALID_INPUT', 'Password must be at least 8 characters');
  }
  if (password !== confirmPassword) {
    return error(400, 'INVALID_INPUT', 'Passwords do not match');
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return error(409, 'INVALID_INPUT', 'Account already exists. Please sign in.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      plan: 'FREE',
      freeUsageCount: 2,
      dailyUsageCount: 0,
      dailyUsageResetAt: null,
      planExpiry: null,
    } as unknown as Parameters<typeof prisma.user.create>[0]['data'],
  });

  return NextResponse.json({ ok: true });
}

