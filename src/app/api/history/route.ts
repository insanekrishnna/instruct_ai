import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, code, ...(extra ?? {}) }, { status });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return error(401, 'UNAUTHORIZED', 'Not logged in');

  const generations = await prisma.generation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      platform: true,
      tone: true,
      output: true,
      hashtags: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    generations.map((g) => ({
      ...g,
      hashtags: g.hashtags,
    }))
  );
}

