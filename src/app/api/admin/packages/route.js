// app/api/admin/activities/route.js
import { NextResponse } from 'next/server';
import { getAllPackagesAdmin } from '@/lib/services/package';
import { delay } from '@/lib/utils';

export async function GET(req) {
  const query = req.nextUrl.search;
  await delay(500);
  const data = await getAllPackagesAdmin(query);
  return NextResponse.json({ data });
}
