// app/api/admin/vendors/[id]/routes/route.js
import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getRoutesByVendorIdAdmin } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  try {
    const { vendorId } = await params;
    console.log(`[API Route] Fetching routes for vendor ID: ${vendorId}`);

    const query = req.nextUrl.search;

    const data = await getRoutesByVendorIdAdmin(vendorId, query);
    console.log(`[API Route] Success fetching routes for vendor ${vendorId}`);

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`[API Route Error] Error fetching routes:`, error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
