// app/api/admin/activities/route.js
import { NextResponse } from 'next/server';
import { getAllActivitesAdmin } from '@/lib/services/activites';
export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllActivitesAdmin(query);
  return NextResponse.json({ data });
}
