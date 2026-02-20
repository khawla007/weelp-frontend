// app/api/admin/vendors/[id]/pricing/route.js
import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getPriceByVendorIdAdmin } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const query = req.nextUrl.search;
  await delay(500);

  const data = await getPriceByVendorIdAdmin(vendorId, query);
  return NextResponse.json({ data });
}
