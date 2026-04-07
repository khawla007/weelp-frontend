// app/api/admin/cities/list/route.js
import { NextResponse } from 'next/server';
import { getCitiesListAdmin } from '@/lib/services/cities';

export async function GET() {
  try {
    const data = await getCitiesListAdmin();

    if (!data?.success) {
      return NextResponse.json({ success: false, data: [], message: 'Failed to fetch cities.' }, { status: 200 });
    }

    return NextResponse.json({ ...data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected server error.' }, { status: 500 });
  }
}
