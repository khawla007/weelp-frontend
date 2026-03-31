import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET() {
  try {
    const response = await publicApi.get('api/regions-cities');
    return NextResponse.json(response.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Service unavailable';
    return NextResponse.json({ data: [], error: message }, { status: error.response?.status || 500 });
  }
}
