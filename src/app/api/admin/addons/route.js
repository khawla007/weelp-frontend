// app/api/admin/addons/route.js
import { NextResponse } from 'next/server';
import { getAllAddOnsAdmin } from '@/lib/services/addOn';
import { log } from '@/lib/utils';

export async function GET(req) {
  try {
    log(req);
    const query = req.nextUrl.search || '';
    const response = await getAllAddOnsAdmin(query);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/addons:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Failed to fetch add-ons' }, { status: 500 });
  }
}
