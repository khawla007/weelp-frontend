// app/api/public/region/route.js
import { NextResponse } from 'next/server';
import { getAllRegions } from '@/lib/services/region';

export async function GET() {
  const result = await getAllRegions();

  // Return only the contents of data
  return NextResponse.json({ ...result.data }, { status: result.status });
}
