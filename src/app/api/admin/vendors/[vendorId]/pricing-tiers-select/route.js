// app/api/admin/vendors/[vendorId]/pricing-tiers-select/route.js
import { NextResponse } from 'next/server';
import { getPriceByVendorIdOptions } from '@/lib/services/vendors';

export async function GET(req, { params }) {
    try {
        const { vendorId } = await params;
        const data = await getPriceByVendorIdOptions(vendorId);
        return NextResponse.json({ ...data });
    } catch (error) {
        return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
    }
}
