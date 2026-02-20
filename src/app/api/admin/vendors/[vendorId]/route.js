// app/api/admin/vendors/[vendorId]/route.js

import { NextResponse } from 'next/server';
import { delay, log } from '@/lib/utils';
import { getVendorByIdAdmin } from '@/lib/services/vendors'; // get vehicles by vendor id

export async function GET(req, { params }) {
  const { vendorId } = await params;

  await delay(500);

  const data = await getVendorByIdAdmin(vendorId);

  return NextResponse.json({ ...data });
}
