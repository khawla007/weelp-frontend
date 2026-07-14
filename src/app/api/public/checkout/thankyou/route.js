import { NextResponse } from 'next/server';

import { getUserOrderThankyou } from '@/lib/services/orders';

const VALID_PAYMENT_INTENT = /^pi_[A-Za-z0-9_]+$/;

function safeError(status) {
  if (status === 401) return { status, error: 'Authentication required' };
  if (status === 404) return { status, error: 'Payment confirmation not found' };
  if (status === 400 || status === 422) return { status, error: 'Invalid payment confirmation' };
  return { status: 500, error: 'Unable to verify payment' };
}

export async function GET(request) {
  const paymentIntent = new URL(request.url).searchParams.get('payment_intent');
  if (!paymentIntent || !VALID_PAYMENT_INTENT.test(paymentIntent)) {
    return NextResponse.json({ error: 'Invalid payment confirmation' }, { status: 400 });
  }

  try {
    const response = await getUserOrderThankyou(paymentIntent);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const safe = safeError(error?.response?.status);
    return NextResponse.json({ error: safe.error }, { status: safe.status });
  }
}
