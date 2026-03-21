// /api/admin/reviews/items/[itemType]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import axios from 'axios';

/**
 * Proxy API handler to fetch review items by type
 * @param {ItemType}
 * @returns {Promise<NextResponse>}
 */
export async function GET(req, { params }) {
  const { itemType } = await params;
  console.log('[API Route] /api/admin/reviews/items/[itemType] - itemType:', itemType);

  try {
    // Get session explicitly
    const session = await auth();
    console.log('[API Route] Session:', session ? 'Found' : 'Not found');

    if (!session?.access_token) {
      console.error('[API Route] No access token in session');
      return NextResponse.json({ success: false, data: [], error: 'Unauthorized' }, { status: 401 });
    }

    // Make API call with explicit token
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    });

    const response = await api.get(`/api/admin/reviews/items/?item_type=${itemType}`);
    console.log('[API Route] Backend response:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('[API Route] Error:', error.message);
    console.error('[API Route] Error response:', error.response?.data);

    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message,
      },
      { status: error.response?.status || 500 },
    );
  }
}
