import { NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status });
}

function getHeader(headers: Headers, name: string): string {
  return headers.get(name) ?? headers.get(name.toLowerCase()) ?? '';
}

function pick(obj: unknown, paths: string[]): unknown {
  for (const p of paths) {
    const parts = p.split('.');
    let cur: unknown = obj;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') {
        cur = undefined;
        break;
      }
      cur = (cur as Record<string, unknown>)[part];
    }
    if (cur !== undefined && cur !== null) return cur;
  }
  return undefined;
}

function extractMetadata(payload: unknown): { userId?: string; plan?: 'daily' | 'monthly' } {
  const meta = pick(payload, [
    'data.metadata',
    'data.payload.metadata',
    'data.payment.metadata',
    'data.subscription.metadata',
    'data.payload.payment.metadata',
    'data.payload.subscription.metadata',
  ]);
  if (!meta || typeof meta !== 'object') return {};
  const rec = meta as Record<string, unknown>;
  const userId = typeof rec.userId === 'string' ? rec.userId : undefined;
  const plan = rec.plan === 'daily' || rec.plan === 'monthly' ? (rec.plan as 'daily' | 'monthly') : undefined;
  return { userId, plan };
}

function parseEpochOrIso(value: unknown): Date | null {
  if (typeof value === 'number') return new Date(value * (value > 10_000_000_000 ? 1 : 1000));
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return new Date(n * (n > 10_000_000_000 ? 1 : 1000));
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) return error(500, 'GENERATION_FAILED', 'Webhook secret not configured');

  const raw = await req.text();
  const headers = {
    'webhook-id': getHeader(req.headers, 'webhook-id'),
    'webhook-signature': getHeader(req.headers, 'webhook-signature'),
    'webhook-timestamp': getHeader(req.headers, 'webhook-timestamp'),
  };

  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(raw, headers);
  } catch {
    return error(401, 'UNAUTHORIZED', 'Invalid signature');
  }

  const webhookId = headers['webhook-id'];
  if (webhookId) {
    const dedupeKey = `dodo:webhook:${webhookId}`;
    const set = await redis.set(dedupeKey, '1', { nx: true, ex: 7 * 24 * 60 * 60 });
    if (set !== 'OK') {
      return NextResponse.json({ received: true });
    }
  }

  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return error(400, 'INVALID_INPUT', 'Invalid JSON payload');
  }

  const type =
    event && typeof event === 'object' && 'type' in event
      ? String((event as Record<string, unknown>).type ?? '')
      : '';
  const { userId, plan } = extractMetadata(event);

  const subscriptionId =
    pick(event, ['data.subscription_id', 'data.payload.subscription_id', 'data.payload.id', 'data.payload.subscription.id']) ??
    pick(event, ['data.subscription.id', 'data.subscription.id']);
  const customerId =
    pick(event, ['data.customer_id', 'data.payload.customer_id', 'data.payload.customer.id', 'data.customer.id']) ?? null;
  const currentPeriodEndRaw =
    pick(event, ['data.current_period_end', 'data.payload.current_period_end', 'data.subscription.current_period_end']) ??
    null;
  const currentPeriodEnd = parseEpochOrIso(currentPeriodEndRaw);

  const now = new Date();

  const isPaymentSuccess = type === 'payment.success' || type === 'payment.succeeded' || type === 'payment.successful';
  const isCancelled = type === 'subscription.cancelled' || type === 'subscription.canceled';
  const isExpired = type === 'subscription.expired' || type === 'subscription.ended';

  if (isPaymentSuccess && userId && plan) {
    const paidPlan = plan === 'daily' ? 'DAILY' : 'MONTHLY';
    const expiry = currentPeriodEnd ?? (plan === 'daily' ? addMs(now, 24 * 60 * 60 * 1000) : addMs(now, 30 * 24 * 60 * 60 * 1000));

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          plan: paidPlan,
          planExpiry: expiry,
          dailyUsageCount: 0,
          dailyUsageResetAt: addMs(now, 24 * 60 * 60 * 1000),
        },
      });

      if (subscriptionId && customerId) {
        await tx.subscription.upsert({
          where: { userId },
          create: {
            userId,
            dodoSubscriptionId: String(subscriptionId),
            dodoCustomerId: String(customerId),
            plan: paidPlan,
            status: 'ACTIVE',
            currentPeriodEnd: expiry,
          },
          update: {
            dodoSubscriptionId: String(subscriptionId),
            dodoCustomerId: String(customerId),
            plan: paidPlan,
            status: 'ACTIVE',
            currentPeriodEnd: expiry,
          },
        });
      }
    });
  }

  if ((isCancelled || isExpired) && userId) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          plan: 'FREE',
          planExpiry: null,
          dailyUsageCount: 0,
          dailyUsageResetAt: null,
        },
      });

      await tx.subscription.updateMany({
        where: { userId },
        data: { status: isCancelled ? 'CANCELLED' : 'EXPIRED' },
      });
    });
  }

  return NextResponse.json({ received: true });
}

