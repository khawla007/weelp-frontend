// app/api/admin/activities/route.js
import { NextResponse } from 'next/server';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { delay } from '@/lib/utils';

export async function GET(req) {
  await delay(500);
  const query = req.nextUrl.search;
  const data = await getAllActivitesAdmin(query);
  return NextResponse.json({ data });
}
