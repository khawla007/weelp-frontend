// app/api/public/user/email/revalidate-email/route.ts
import { publicApi } from '@/lib/axiosInstance';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();

    const { email } = formData; // destructure email

    if (!email) {
      return new NextResponse.json({ success: false, message: 'Email is required' });
    }

    // Use your Axios instance
    const res = await publicApi.post('/api/resend-verification', {
      email,
    });

    const data = res.data;
    return NextResponse.json({ ...data });
  } catch (err) {
    console.error('Fetch Error:', err);
    return NextResponse.json({ success: false, message: 'Invalid or expired token' });
  }
}
