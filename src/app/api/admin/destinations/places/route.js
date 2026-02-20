// app/api/admin/destinations/places/route.js
import { NextResponse } from 'next/server';
import { getAllPlacesAdmin } from '@/lib/services/places';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();

  try {
    // reuse your existing API util
    const data = await getAllPlacesAdmin(`?${query}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
