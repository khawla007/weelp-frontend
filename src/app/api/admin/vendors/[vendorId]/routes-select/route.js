// app/api/admin/vendors/[vendorId]/routes-select/route.js
import { NextResponse } from 'next/server';
import { getRoutesByVendorIdOptions } from '@/lib/services/vendors';

export async function GET(req, { params }) {
    try {
        const { vendorId } = await params;
        const data = await getRoutesByVendorIdOptions(vendorId);
        return NextResponse.json({ ...data });
    } catch (error) {
        return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
    }
}
