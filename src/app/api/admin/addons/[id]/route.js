// app/api/admin/addons/[id]route.js
import { NextResponse } from 'next/server';
import { getAllAddOnsAdmin, getSingleAddOnAdmin } from '@/lib/services/addOn';
import { log } from '@/lib/utils';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const response = await getSingleAddOnAdmin(id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/addons:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Failed to fetch add-ons' }, { status: 500 });
  }
}
