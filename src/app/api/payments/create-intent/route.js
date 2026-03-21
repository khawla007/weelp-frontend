// /api/payments/create-intent

import { NextResponse } from 'next/server';
import { log } from '@/lib/utils';
import { createPaymentIntent } from '@/lib/actions/checkout';

export async function POST(req) {
  try {
    const data = await req.json();

    log(data);
    const response = await createPaymentIntent(data);
    return NextResponse.json({ ...response });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
