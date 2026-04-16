import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET(request) {
  try {
    const query = request.nextUrl.search;
    const response = await publicApi.get(`api/itineraries/featured-itineraries${query}`);
    return NextResponse.json(response.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Service unavailable';
    return NextResponse.json({ data: [], error: message }, { status: error.response?.status || 500 });
  }
}
