import { Redis } from '@upstash/redis';

export type PaidPlan = 'daily' | 'monthly';

type DodoProductResponse = {
  product_id: string;
};

type DodoCheckoutResponse = {
  checkout_url: string | null;
  session_id: string;
};

const BASE_URL = 'https://live.dodopayments.com';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

async function dodoFetch<T>(path: string, init: RequestInit): Promise<T> {
  const bearer = requireEnv('DODO_PAYMENTS_API_KEY');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`,
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Dodo API error (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

async function ensureProductId(plan: PaidPlan): Promise<string> {
  const cacheKey = `dodo:product:${plan}`;
  const cached = await redis.get<string | null>(cacheKey);
  if (cached) return cached;

  const currency = 'INR';
  const tax_category = 'digital_products';

  const isDaily = plan === 'daily';
  const price = isDaily ? 900 : 19900; // lowest denomination (paise)
  const name = isDaily ? 'Capmax AI - Daily' : 'Capmax AI - Monthly';

  const body = {
    name,
    tax_category,
    price: {
      type: 'recurring_price',
      currency,
      price,
      discount: 0,
      purchasing_power_parity: false,
      payment_frequency_count: 1,
      payment_frequency_interval: isDaily ? 'day' : 'month',
      subscription_period_count: 1,
      subscription_period_interval: isDaily ? 'day' : 'month',
      trial_period_days: 0,
      tax_inclusive: false,
    },
  };

  const created = await dodoFetch<DodoProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  await redis.set(cacheKey, created.product_id);
  return created.product_id;
}

export async function createCheckoutSession(params: {
  plan: PaidPlan;
  user: { id: string; email: string; name?: string | null };
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ checkoutUrl: string }> {
  const productId = await ensureProductId(params.plan);

  const body = {
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: { email: params.user.email, name: params.user.name ?? undefined },
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.user.id,
      plan: params.plan,
    },
  };

  const created = await dodoFetch<DodoCheckoutResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!created.checkout_url) {
    throw new Error('Dodo did not return a checkout URL');
  }

  return { checkoutUrl: created.checkout_url };
}

