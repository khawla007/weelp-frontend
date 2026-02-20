// app/api/admin/destinations/places/placesdropdown/route.js
import { NextResponse } from 'next/server';
import { getPlacesByAdminOptions } from '@/lib/services/places';

export async function GET() {
  try {
    const data = await getPlacesByAdminOptions();

    // If success is false in response, you still send a controlled error
    if (!data?.success) {
      return NextResponse.json({ success: false, message: 'Failed to fetch data from API.' }, { status: 500 });
    }

    return NextResponse.json({ ...data });
  } catch (error) {
    // console.error("Proxy Error:", error);
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
