// app/api/customer/reviews/route.js - handles customer reviews
import { NextResponse } from 'next/server';

import { getAuthApi } from '@/lib/axiosInstance';

// get all reviews
export async function GET(req) {
  try {
    const api = await getAuthApi();
    const query = req.nextUrl.search;
    const response = await api.get(`/api/customer/review/${query || ''}`, {
      headers: { Accept: 'application/json' },
    });

    return NextResponse.json({ data: response.data, status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        data: { reviews: [] },
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch reviews',
      },
      { status: error.response?.status || 500 },
    );
  }
}
