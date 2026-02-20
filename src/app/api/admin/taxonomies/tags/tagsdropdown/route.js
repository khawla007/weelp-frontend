// app/api/admin/taxonomies/categories/tagsdropdown/route.js
import { NextResponse } from 'next/server';
import { getAllTagsOptionsAdmin } from '@/lib/services/tags';

export async function GET() {
  const data = await getAllTagsOptionsAdmin();
  return NextResponse.json(data);
}
