import { Plan } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const DAILY_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function add24h(date: Date): Date {
  return new Date(date.getTime() + DAY_MS);
}

async function downgradeToFree(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: Plan.FREE,
      planExpiry: null,
      dailyUsageCount: 0,
      dailyUsageResetAt: null,
    },
  });
}

export async function resetDailyIfNeeded(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiry: true, dailyUsageResetAt: true },
  });

  if (!user) return;

  const now = new Date();

  if (user.plan !== Plan.FREE && user.planExpiry && user.planExpiry.getTime() <= now.getTime()) {
    await downgradeToFree(userId);
    return;
  }

  if (user.plan === Plan.DAILY || user.plan === Plan.MONTHLY) {
    const shouldReset = !user.dailyUsageResetAt || user.dailyUsageResetAt.getTime() <= now.getTime();
    if (shouldReset) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyUsageCount: 0,
          dailyUsageResetAt: add24h(now),
        },
      });
    }
  }
}

export async function checkCredits(
  userId: string
): Promise<{ allowed: boolean; reason: string; remaining: number }> {
  await resetDailyIfNeeded(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiry: true,
      freeUsageCount: true,
      dailyUsageCount: true,
    },
  });

  if (!user) {
    return { allowed: false, reason: 'UNAUTHORIZED', remaining: 0 };
  }

  const now = new Date();
  if (user.plan !== Plan.FREE && user.planExpiry && user.planExpiry.getTime() <= now.getTime()) {
    await downgradeToFree(userId);
    const downgraded = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeUsageCount: true },
    });
    const remaining = downgraded?.freeUsageCount ?? 0;
    return {
      allowed: remaining > 0,
      reason: remaining > 0 ? 'OK' : 'PLAN_EXPIRED',
      remaining,
    };
  }

  if (user.plan === Plan.FREE) {
    const remaining = user.freeUsageCount;
    return {
      allowed: remaining > 0,
      reason: remaining > 0 ? 'OK' : 'NO_CREDITS',
      remaining,
    };
  }

  const remaining = Math.max(DAILY_LIMIT - user.dailyUsageCount, 0);
  return {
    allowed: remaining > 0,
    reason: remaining > 0 ? 'OK' : 'NO_CREDITS',
    remaining,
  };
}

export async function useCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
  await resetDailyIfNeeded(userId);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planExpiry: true,
        freeUsageCount: true,
        dailyUsageCount: true,
      },
    });

    if (!user) return { success: false, remaining: 0 };

    const now = new Date();
    if (user.plan !== Plan.FREE && user.planExpiry && user.planExpiry.getTime() <= now.getTime()) {
      await tx.user.update({
        where: { id: userId },
        data: {
          plan: Plan.FREE,
          planExpiry: null,
          dailyUsageCount: 0,
          dailyUsageResetAt: null,
        },
      });

      const remaining = user.freeUsageCount;
      return { success: remaining > 0, remaining };
    }

    if (user.plan === Plan.FREE) {
      if (user.freeUsageCount <= 0) return { success: false, remaining: 0 };

      const updated = await tx.user.update({
        where: { id: userId },
        data: { freeUsageCount: { decrement: 1 } },
        select: { freeUsageCount: true },
      });

      return { success: true, remaining: updated.freeUsageCount };
    }

    if (user.dailyUsageCount >= DAILY_LIMIT) {
      return { success: false, remaining: 0 };
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: { dailyUsageCount: { increment: 1 } },
      select: { dailyUsageCount: true },
    });

    const remaining = Math.max(DAILY_LIMIT - updated.dailyUsageCount, 0);
    return { success: true, remaining };
  });
}

