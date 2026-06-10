import { NextResponse } from 'next/server';
import { getPublishedPage } from '@/lib/services/pages';
import { isPublishedPage } from '@/lib/pages/normalizers';

export async function GET(req, { params }) {
  const { slug } = await params;
  const pageData = await getPublishedPage(slug);

  if (!pageData?.success || !pageData?.data || !isPublishedPage(pageData.data)) {
    return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
  }

  return NextResponse.json(pageData);
}
