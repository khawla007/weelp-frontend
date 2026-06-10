import { NextResponse } from 'next/server';
import { getSinglePageAdmin } from '@/lib/services/pages';

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const pageData = await getSinglePageAdmin(id);
    return NextResponse.json(pageData);
  } catch (error) {
    console.error('Error fetching CMS page:', error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Something went wrong',
      },
      { status: 500 },
    );
  }
}
