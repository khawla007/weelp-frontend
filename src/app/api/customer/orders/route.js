// app/api/customer/orders/route.js  handles customer orders
import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';

import { getAllOrdersCustomer } from '@/lib/services/customer/orders';

// get all orders
export async function GET(req) {
  const query = req.nextUrl.search;
  await delay(500);
  const data = ({} = await getAllOrdersCustomer(query));

  return NextResponse.json({ data });
}
