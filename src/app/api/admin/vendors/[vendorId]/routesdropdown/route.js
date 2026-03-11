// app/api/admin/vendors/[id]/routesdropdown/route.js
import { NextResponse } from 'next/server';
import { getRoutesByVendorIdOptions } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  try {
  const { vendorId } = await params;
    console.log("[API Route] Fetching routesdropdown for ID: ", vendorId);

  const data = await getRoutesByVendorIdOptions(vendorId);

    console.log("[API Route] Success fetching routesdropdown");
  return NextResponse.json({ ...data });
  } catch (error) {
    console.error("[API Route Error]", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
