// /api/admin/reviews/[id]route.js
import { NextResponse } from 'next/server';
import { getSingleReviewAdmin } from '@/lib/services/reviews';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const result = await getSingleReviewAdmin(id);

    // Just forward service response as-is
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
