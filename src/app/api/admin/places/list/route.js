// app/api/admin/places/list/route.js
import { NextResponse } from 'next/server';
import { getPlacesByAdminOptions } from '@/lib/services/places';

export async function GET() {
  try {
    const data = await getPlacesByAdminOptions();

    if (!data || (!data?.success && !data?.data)) {
      return NextResponse.json({ success: false, message: 'Failed to fetch places from API.' }, { status: 500 });
    }

    return NextResponse.json({ ...data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
