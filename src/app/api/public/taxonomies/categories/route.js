// app/api/public/taxonomies/categories/route.js

import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/services/global';

export async function GET(req) {
  const data = await getCategories();

  return NextResponse.json({ data });
}
