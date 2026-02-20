// /api/admin/reviews/route.js
import { NextResponse } from 'next/server';
import { getAllReviewsAdmin } from '@/lib/services/reviews';
import { log } from '@/lib/utils';

/**
 * Proxy API handler to fetch review items by type
 * @returns {Promise<NextResponse>}
 */
export async function GET(req) {
  const { search = '' } = req.nextUrl; // destructure search
  const data = await getAllReviewsAdmin(search);
  return NextResponse.json({ ...data });
}
