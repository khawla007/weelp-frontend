import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET(request, { params }) {
  try {
    const { region } = await params;
    const query = request.nextUrl.search;
    const response = await publicApi.get(`api/region/${region}/region-itineraries${query}`);
    return NextResponse.json(response.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Service unavailable';
    return NextResponse.json({ data: [], error: message }, { status: error.response?.status || 500 });
  }
}
