// app/api/admin/destinations/states/route.js
import { NextResponse } from 'next/server';
import { getAllStatesAdmin } from '@/lib/services/state';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();

  try {
    // reuse your existing API util
    const data = await getAllStatesAdmin(`?${query}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
