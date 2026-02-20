// app/api/admin/vendors/[id]/driversdropdown/route.js

import { NextResponse } from 'next/server';
import { getDriversByVendorIdOptions } from '@/lib/services/vendors'; // get drivers by vendor id

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const data = await getDriversByVendorIdOptions(vendorId);

  return NextResponse.json({ data });
}
