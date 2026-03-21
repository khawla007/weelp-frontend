// app/api/admin/packages/[id]/route.js
import { NextResponse } from 'next/server';
import { getSinglePackageAdmin } from '@/lib/services/package';
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const packageData = await getSinglePackageAdmin(id);

    if (packageData && packageData.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: packageData.message || 'Package not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: packageData });
  } catch (error) {
    console.error('Error fetching package:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Something went wrong',
      },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();

    // Import authApi dynamically to avoid SSR issues
    const { authApi } = await import('@/lib/axiosInstance');

    const response = await authApi.put(`/api/admin/packages/${id}`, body);

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Package updated successfully',
    });
  } catch (error) {
    console.error('Error updating package:', error);

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

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    // Import authApi dynamically to avoid SSR issues
    const { authApi } = await import('@/lib/axiosInstance');

    const response = await authApi.delete(`/api/admin/packages/${id}`);

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);

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
