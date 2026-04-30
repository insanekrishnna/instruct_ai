import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resetDailyIfNeeded } from '@/lib/credits';
import { prisma } from '@/lib/prisma';

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, code, ...(extra ?? {}) }, { status });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return error(401, 'UNAUTHORIZED', 'Not logged in');

  await resetDailyIfNeeded(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      planExpiry: true,
      freeUsageCount: true,
      dailyUsageCount: true,
      dailyUsageResetAt: true,
    },
  });

  if (!user) return error(401, 'UNAUTHORIZED', 'Not logged in');

  const remaining =
    user.plan === 'FREE' ? user.freeUsageCount : Math.max(5 - (user.dailyUsageCount ?? 0), 0);

  return NextResponse.json({
    plan: user.plan,
    remaining,
    resetAt: user.plan === 'FREE' ? null : user.dailyUsageResetAt,
    planExpiry: user.plan === 'FREE' ? null : user.planExpiry,
  });
}

