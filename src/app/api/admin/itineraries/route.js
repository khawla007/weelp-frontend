// app/api/admin/activities/route.js
import { NextResponse } from 'next/server';
import { getAllItinerariesAdmin } from '@/lib/services/itineraries';
export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllItinerariesAdmin(query);
  return NextResponse.json({ data });
}
