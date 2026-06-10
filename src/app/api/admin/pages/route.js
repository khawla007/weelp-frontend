import { NextResponse } from 'next/server';
import { getAllPagesAdmin } from '@/lib/services/pages';
import { unwrapPageListResponse } from '@/lib/pages/normalizers';

export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllPagesAdmin(query);

  return NextResponse.json({ data: unwrapPageListResponse(data) });
}
