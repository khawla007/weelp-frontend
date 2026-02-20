// app/api/admin/destinations/cities/route.js
import { NextResponse } from 'next/server';
import { getAllCitiesAdminV2 } from '@/lib/services/cities';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();

  try {
    // reuse your existing API util
    const data = await getAllCitiesAdminV2(`?${query}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
