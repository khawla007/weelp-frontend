// app/api/admin/vendors/[vendorId]/route.js

import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getVendorByIdAdmin } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  try {
    const { vendorId } = await params;
    console.log(`[API Route] Fetching vendor with ID: ${vendorId}`);


    const data = await getVendorByIdAdmin(vendorId);
    console.log(`[API Route] Success fetching vendor ${vendorId}`);

    return NextResponse.json({ ...data });
  } catch (error) {
    console.error(`[API Route Error] Error fetching vendor:`, error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
