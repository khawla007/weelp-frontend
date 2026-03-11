// app/api/admin/packages/bulk-delete/route.js
import { NextResponse } from 'next/server';
import { delay } from '@/lib/utils';

export async function POST(req) {
  try {
    const body = await req.json();
    const { package_ids } = body;
    await delay(500);

    // Import authApi dynamically to avoid SSR issues
    const { authApi } = await import('@/lib/axiosInstance');

    const response = await authApi.post('/api/admin/packages/bulk-delete', {
      package_ids,
    });

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Packages deleted successfully',
    });
  } catch (error) {
    console.error('Error bulk deleting packages:', error);

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
