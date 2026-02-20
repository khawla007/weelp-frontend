// app/api/admin/vendors/[id]/schedules/route.js
import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getSchedulesByVendorIdAdmin } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const query = req.nextUrl.search;

  const data = await getSchedulesByVendorIdAdmin(vendorId, query);

  return NextResponse.json({ data });
}
