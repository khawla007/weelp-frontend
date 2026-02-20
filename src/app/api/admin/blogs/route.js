// app/api/admin/blogs/route.js
import { NextResponse } from 'next/server';
import { getAllBlogsAdmin } from '@/lib/services/blogs';
import { delay } from '@/lib/utils';

export async function GET(req) {
  await delay(500);
  const query = req.nextUrl.search;
  const data = await getAllBlogsAdmin(query);
  return NextResponse.json({ data });
}
