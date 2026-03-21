// app/api/admin/blogs/route.js
import { NextResponse } from 'next/server';
import { getAllBlogsAdmin } from '@/lib/services/blogs';
export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllBlogsAdmin(query);
  return NextResponse.json({ data });
}
