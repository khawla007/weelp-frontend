// app/api/admin/taxonomies/categories/route.js
import { NextResponse } from 'next/server';
import { getCategoriesAdmin } from '@/lib/services/global';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');

  const data = await getCategoriesAdmin(page);

  return NextResponse.json({ data });
}
