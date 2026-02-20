// /api/admin/taxonomies/attributes/[slug]/route.js
import { NextResponse } from 'next/server';
import { getAttributeBySlugAdmin } from '@/lib/services/attributes';

export async function GET(req, { params }) {
  const { slug } = await params;
  const data = await getAttributeBySlugAdmin(slug);

  return NextResponse.json({ data });
}
