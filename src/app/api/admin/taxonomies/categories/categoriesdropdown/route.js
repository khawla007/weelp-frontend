// app/api/admin/taxonomies/categories/categoriesdropdown/route.js
import { NextResponse } from 'next/server';
import { getAllCategoriesOptionsAdmin } from '@/lib/services/categories';

export async function GET() {
  const data = await getAllCategoriesOptionsAdmin();
  return NextResponse.json(data);
}
