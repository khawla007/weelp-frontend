// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { getAllUsersAdmin } from '@/lib/services/users';

export async function GET(req) {
  const query = req.nextUrl.search;
  const data = await getAllUsersAdmin(query);
  return NextResponse.json({ ...data });
}
