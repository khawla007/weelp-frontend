// app/api/admin/vendors/[id]/vehiclesdropdown/route.js

import { NextResponse } from 'next/server';
import { getVehiclesByVendorIdOptions } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const data = await getVehiclesByVendorIdOptions(vendorId);

  return NextResponse.json({ data });
}
