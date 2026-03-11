// app/api/admin/vendors/[id]/availabilitydropdown/route.js

import { NextResponse } from 'next/server';
import { getAvailabilityByVendorIdOptions } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  try {
  const { vendorId } = await params;
    console.log("[API Route] Fetching availabilitydropdown for ID: ", vendorId);

  const data = await getAvailabilityByVendorIdOptions(vendorId);

    console.log("[API Route] Success fetching availabilitydropdown");
  return NextResponse.json({ ...data });
  } catch (error) {
    console.error("[API Route Error]", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
