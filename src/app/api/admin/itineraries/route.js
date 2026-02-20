// app/api/admin/activities/route.js
import { NextResponse } from 'next/server';
import { getAllItinerariesAdmin } from '@/lib/services/itineraries';
import { delay } from '@/lib/utils';

export async function GET(req) {
  await delay(500);
  const query = req.nextUrl.search;
  const data = await getAllItinerariesAdmin(query);
  return NextResponse.json({ data });
}
