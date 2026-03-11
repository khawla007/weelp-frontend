// app/api/admin/vendors/vendor-select/route.js
import { NextResponse } from 'next/server';
import { getAllVendorsOptions } from '@/lib/services/vendors';

export async function GET() {
    try {
        const data = await getAllVendorsOptions();
        return NextResponse.json({ ...data });
    } catch (error) {
        return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
    }
}
