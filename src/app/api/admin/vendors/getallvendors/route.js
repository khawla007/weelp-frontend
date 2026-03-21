import { NextResponse } from 'next/server';
import { delay } from '@/lib/utils';
import { getAllVendorsAdmin } from '@/lib/services/vendors';

export async function GET(req) {
  try {
    const query = req.nextUrl.search;
    const data = await getAllVendorsAdmin(query);
    return NextResponse.json({ ...data });
  } catch (error) {
    console.error('[API Route] Error fetching vendors:', error.message);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch vendors' }, { status: error.response?.status || 500 });
  }
}
