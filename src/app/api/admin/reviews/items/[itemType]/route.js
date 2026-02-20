// /api/admin/reviews/items/[itemType]/route.js
import { NextResponse } from 'next/server';
import { getAllItemsByTypeOptions } from '@/lib/services/reviews';
import { log } from '@/lib/utils';

/**
 * Proxy API handler to fetch review items by type
 * @param {ItemType}
 * @returns {Promise<NextResponse>}
 */
export async function GET(req, { params }) {
  const { itemType } = await params;

  const data = await getAllItemsByTypeOptions(itemType);
  return NextResponse.json({ ...data });
}
