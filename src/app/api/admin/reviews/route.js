// /api/admin/reviews/route.js
import { NextResponse } from 'next/server';
import { getAllReviewsAdmin } from '@/lib/services/reviews';

/**
 * Proxy API handler to fetch review items by type
 * @returns {Promise<NextResponse>}
 */
export async function GET(req) {
  try {
    const query = req.nextUrl.search;
    const data = await getAllReviewsAdmin(query);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Reviews API Error]:', error);
    return NextResponse.json({ data: { data: [], current_page: 1, per_page: 5, total: 0 } }, { status: error?.response?.status || 500 });
  }
}
