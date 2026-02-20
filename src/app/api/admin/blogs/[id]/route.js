// /api/admin/blogs/[id]route.js
import { NextResponse } from 'next/server';
import { getSingleBlogAdmin } from '@/lib/services/blogs';

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    // Fetch blog data from service
    const blogData = await getSingleBlogAdmin(id);

    // Forward service response as-is
    return NextResponse.json(blogData);
  } catch (error) {
    // Log the error for debugging (optional)
    console.error('Error fetching blog:', error);

    // Return standardized error response
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Something went wrong',
      },
      { status: 500 },
    );
  }
}
