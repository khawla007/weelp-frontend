// /api/payments/create-intent

import { publicApi } from '@/lib/axiosInstance';
import { NextResponse } from 'next/server';
import { log } from '@/lib/utils';
import { createPaymentIntent } from '@/lib/actions/checkout';

export async function POST(req) {
  try {
    const { body } = await req.json();

    log(body);
    const response = await createPaymentIntent(JSON.parse(body));
    return NextResponse.json({ ...response });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
