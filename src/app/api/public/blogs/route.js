// app/api/public/blogs/route.js
import { NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/services/blogs';
export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllBlogs(query);
  return NextResponse.json({ data });
}
