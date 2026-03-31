import { NextResponse } from 'next/server';
import { publicApi } from '@/lib/axiosInstance';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const query = request.nextUrl.search;
    const response = await publicApi.get(`api/cities/${id}/all-items${query}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ data: [], error: error.message }, { status: error.response?.status || 500 });
  }
}
