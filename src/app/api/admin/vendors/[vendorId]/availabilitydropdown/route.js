// app/api/admin/vendors/[id]/availabilitydropdown/route.js

import { NextResponse } from 'next/server';
import { getAvailabilityByVendorIdOptions } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const data = await getAvailabilityByVendorIdOptions(vendorId);

  return NextResponse.json({ ...data });
}
