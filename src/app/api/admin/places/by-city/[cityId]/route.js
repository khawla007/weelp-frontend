// app/api/admin/places/by-city/[cityId]/route.js
import { NextResponse } from 'next/server';
import { getPlacesByCityAdmin } from '@/lib/services/places';

export async function GET(request, { params }) {
  try {
    const { cityId } = await params;

    if (!cityId) {
      return NextResponse.json({ success: false, message: 'City ID is required.' }, { status: 400 });
    }

    const data = await getPlacesByCityAdmin(cityId);

    if (!data?.success) {
      return NextResponse.json({ success: false, data: [], message: 'Failed to fetch places for city.' }, { status: 200 });
    }

    return NextResponse.json({ ...data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
