import { NextResponse } from 'next/server';
import { getUserOrderThankyou } from '@/lib/services/orders';
import { log } from '@/lib/utils';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const payment_intent = searchParams.get('payment_intent');

  const response = await getUserOrderThankyou(payment_intent);
  return NextResponse.json(response);
}
