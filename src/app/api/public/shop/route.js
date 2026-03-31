import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET(request) {
  try {
    const query = request.nextUrl.search;
    const response = await publicApi.get(`api/shop${query}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ data: [], error: error.message }, { status: error.response?.status || 500 });
  }
}
