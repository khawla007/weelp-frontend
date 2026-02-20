// app/api/admin/vendors/vendorsdropdown/route.js
import { NextResponse } from 'next/server';
import { getAllVendorsOptions } from '@/lib/services/vendors';

export async function GET() {
  const data = await getAllVendorsOptions();
  return NextResponse.json({ ...data });
}
