// /api/payments/create-order

import { NextResponse } from 'next/server';
import { checkoutCreateOrder } from '@/lib/actions/checkout';

export async function POST(req) {
  try {
    const orderData = await req.json();

    const orderResponse = await checkoutCreateOrder(orderData);

    // Propagate the inner success/failure status directly
    return NextResponse.json(orderResponse);
  } catch {
    return NextResponse.json({ success: false, error: 'Error creating order' }, { status: 500 });
  }
}
