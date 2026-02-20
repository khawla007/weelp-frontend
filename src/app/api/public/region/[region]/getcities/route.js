// app/api/public/region/[region]/getcities/route.js
import { getCitiesByRegion } from '@/lib/services/region';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { region } = await params;
  const result = await getCitiesByRegion(region);

  // Return only the contents of data
  return NextResponse.json({ ...result });
}
