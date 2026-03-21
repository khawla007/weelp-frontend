// app/api/admin/packages/[id]/partial-delete/route.js
import { NextResponse } from 'next/server';
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();

    // Import authApi dynamically to avoid SSR issues
    const { authApi } = await import('@/lib/axiosInstance');

    const response = await authApi.delete(`/api/admin/packages/${id}/partial-delete/`, {
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Package items deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package items:', error);

    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || error?.message || 'Something went wrong';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}
