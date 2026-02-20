// app/api/admin/transfers/route.js
import { NextResponse } from 'next/server';
import { getAllTransfersAdmin, getAllTransfersAdminn } from '@/lib/services/transfers';
import { delay } from '@/lib/utils';

export async function GET(req) {
  await delay(500);
  const query = req.nextUrl.search;
  const data = await getAllTransfersAdminn(query);
  return NextResponse.json({ data });
}
