// app/api/admin/vendors/[id]/pricesdropdown/route.js
import { NextResponse } from 'next/server';
import { getPriceByVendorIdOptions } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  const { vendorId } = await params;

  const data = await getPriceByVendorIdOptions(vendorId);
  return NextResponse.json({ ...data });
}
