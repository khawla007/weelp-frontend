// app/api/admin/vendors/[id]/pricesdropdown/route.js
import { NextResponse } from 'next/server';
import { getPriceByVendorIdOptions } from '@/lib/services/vendors';

export async function GET(req, { params }) {
  try {
    const { vendorId } = await params;
    console.log('[API Route] Fetching pricesdropdown for ID: ', vendorId);

    const data = await getPriceByVendorIdOptions(vendorId);
    console.log('[API Route] Success fetching pricesdropdown');
    return NextResponse.json({ ...data });
  } catch (error) {
    console.error('[API Route Error]', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
