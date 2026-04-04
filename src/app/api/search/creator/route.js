import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET(req) {
  const search = req.nextUrl.searchParams.get('search');

  if (!search || search.trim().length < 3) {
    return NextResponse.json({ posts: [] });
  }

  try {
    const response = await publicApi.get('/api/posts', {
      params: { search: search.trim(), per_page: 5 },
      headers: { Accept: 'application/json' },
    });

    return NextResponse.json({ posts: response.data?.data || [] });
  } catch (error) {
    console.error('Creator search error:', error?.message);
    return NextResponse.json({ posts: [] });
  }
}
