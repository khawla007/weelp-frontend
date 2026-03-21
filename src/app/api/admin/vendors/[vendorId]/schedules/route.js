// app/api/admin/vendors/[id]/schedules/route.js
import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getSchedulesByVendorIdAdmin } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  try {
    const { vendorId } = await params;
    console.log('[API Route] Fetching schedules for ID: ', vendorId);

    const query = req.nextUrl.search;

    const data = await getSchedulesByVendorIdAdmin(vendorId, query);

    console.log('[API Route] Success fetching schedules');
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API Route Error]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
