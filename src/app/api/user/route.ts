import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, code, ...(extra ?? {}) }, { status });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return error(401, 'UNAUTHORIZED', 'Not logged in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  });

  if (!user) return error(401, 'UNAUTHORIZED', 'Not logged in');

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: user.createdAt,
    plan: user.plan,
    planExpiry: user.planExpiry,
    dailyUsageCount: user.dailyUsageCount,
    dailyUsageResetAt: user.dailyUsageResetAt,
    freeUsageCount: user.freeUsageCount,
    subscription: user.subscription,
  });
}

