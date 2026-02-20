// app/api/public/menu/route.js
import { NextResponse } from 'next/server';
import { getNavMenuItems } from '@/lib/services/menus';

export async function GET() {
  const result = await getNavMenuItems();

  // Return the full DTO: data, success, status
  return NextResponse.json(result, { status: result.status });
}
