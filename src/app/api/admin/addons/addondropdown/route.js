// /api/admin/addons/addondropdown
import { NextResponse } from 'next/server';
import { getAddOnOptionsAdmin } from '@/lib/services/addOn';

export async function GET() {
  const data = await getAddOnOptionsAdmin();
  return NextResponse.json(data);
}
