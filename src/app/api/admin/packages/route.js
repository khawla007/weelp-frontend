// app/api/admin/packages/route.js
import { NextResponse } from 'next/server';
import { getAllPackagesAdmin } from '@/lib/services/package';
import { delay } from '@/lib/utils';

export async function GET(req) {
  const query = req.nextUrl.search;
  await delay(500);
  const data = await getAllPackagesAdmin(query);
  return NextResponse.json({ data });
}

export async function POST(req) {
  try {
    const body = await req.json();
    await delay(500);

    // Import authApi dynamically to avoid SSR issues
    const { authApi } = await import('@/lib/axiosInstance');

    const response = await authApi.post('/api/admin/packages', body);

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Package created successfully',
    });
  } catch (error) {
    console.error('Error creating package:', error);

    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || error?.message || 'Something went wrong';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}
