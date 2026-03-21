// app/api/admin/transfers/route.js
import { NextResponse } from 'next/server';
import { getAllTransfersAdmin, getAllTransfersAdminn } from '@/lib/services/transfers';
export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllTransfersAdminn(query);
  return NextResponse.json({ data });
}
