// app/api/admin/taxonomies/tags/route.js
import { NextResponse } from 'next/server';
import { getAllTagsAdmin } from '@/lib/services/global';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');

  const data = await getAllTagsAdmin(page);

  return NextResponse.json({ data });
}
