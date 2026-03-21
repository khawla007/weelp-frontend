// app/api/admin/vendors/[id]/availability/route.js

import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getAvailabilityByVendorIdAdmin } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  try {
    const { vendorId } = await params;
    console.log('[API Route] Fetching availability for ID: ', vendorId);

    const query = req.nextUrl.search;

    const data = await getAvailabilityByVendorIdAdmin(vendorId, query);

    console.log('[API Route] Success fetching availability');
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API Route Error]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
