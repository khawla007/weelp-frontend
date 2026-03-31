import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const response = await publicApi.get('api/check-username', { params: { username } });
    return NextResponse.json(response.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Service unavailable';
    return NextResponse.json({ available: false, error: message }, { status: error.response?.status || 500 });
  }
}
