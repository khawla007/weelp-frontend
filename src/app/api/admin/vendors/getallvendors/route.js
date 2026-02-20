// app/api/admin/vendors/getallvendors/route.js
import { NextResponse } from 'next/server';
import { delay } from '@/lib/utils';
import { getAllVendorsAdmin } from '@/lib/services/vendors';

export async function GET(req) {
  const query = req.nextUrl.search;
  await delay(500);
  const data = await getAllVendorsAdmin(query);
  return NextResponse.json({ data });
}
