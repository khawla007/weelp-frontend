// app/api/admin/orders/route.js
import { NextResponse } from 'next/server';
import { log } from '@/lib/utils';
import { getAllOrdersAdmin } from '@/lib/services/orders';

// get all orders
export async function GET(req) {
  const query = req.nextUrl.search;
  const data = ({} = await getAllOrdersAdmin(query));
  return NextResponse.json({ data });
}
