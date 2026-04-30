import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCheckoutSession, type PaidPlan } from '@/lib/dodo';

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, code, ...(extra ?? {}) }, { status });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return error(401, 'UNAUTHORIZED', 'Not logged in');

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return error(400, 'INVALID_INPUT', 'Invalid JSON body');
  }

  const plan = (json as { plan?: unknown })?.plan;
  if (plan !== 'daily' && plan !== 'monthly') return error(400, 'INVALID_INPUT', 'Invalid plan');

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const returnUrl = `${baseUrl}/settings?checkout=success`;
  const cancelUrl = `${baseUrl}/settings?checkout=cancelled`;

  try {
    const { checkoutUrl } = await createCheckoutSession({
      plan: plan as PaidPlan,
      user: { id: session.user.id, email: session.user.email, name: session.user.name },
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (e) {
    return error(500, 'GENERATION_FAILED', e instanceof Error ? e.message : 'Checkout creation failed');
  }
}

