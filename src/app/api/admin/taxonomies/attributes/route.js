// app/api/admin/taxonomies/attributes/route.js
import { NextResponse } from 'next/server';
import { getAllAttributesAdmin } from '@/lib/services/global';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');

  const data = await getAllAttributesAdmin(page);

  return NextResponse.json({ data });
}
