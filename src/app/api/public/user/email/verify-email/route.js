// app/api/public/user/email/verifyemail/route.ts
import { publicApi } from '@/lib/axiosInstance';
import { log } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse.json({ success: false, message: 'Token is required' });
    }

    // Use your Axios instance
    const res = await publicApi.get(`/api/verify-email?token=${token}`);

    const data = res.data;

    return NextResponse.json({ ...data });
  } catch (err) {
    console.error('Fetch Error:', err);
    return NextResponse.json({ success: false, message: 'Invalid or expired token' });
  }
}
