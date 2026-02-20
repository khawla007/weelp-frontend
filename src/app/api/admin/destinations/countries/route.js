// app/api/admin/destinations/countries/route.js
import { NextResponse } from 'next/server';
import { getAllCountriesAdmin } from '@/lib/services/country';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();

  try {
    // reuse your existing API util
    const data = await getAllCountriesAdmin(`?${query}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
