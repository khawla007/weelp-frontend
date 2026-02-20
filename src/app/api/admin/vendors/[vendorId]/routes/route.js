// app/api/admin/vendors/[id]/routes/route.js
import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getRoutesByVendorIdAdmin } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const query = req.nextUrl.search;
  await delay(500);

  const data = await getRoutesByVendorIdAdmin(vendorId, query);

  return NextResponse.json({ data });
}
