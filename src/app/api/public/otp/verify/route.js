import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/verify-otp`, body);

    if (response.status >= 200 && response.status < 300) {
      return NextResponse.json(response.data, { status: response.status });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { response } = error;
      const { status, data } = response;

      if (status === 400) {
        return NextResponse.json({ message: data.message || 'Invalid OTP' }, { status: 400 });
      }

      if (status === 404) {
        return NextResponse.json({ message: data.message || 'OTP expired or not found' }, { status: 404 });
      }

      if (status === 422) {
        return NextResponse.json(
          {
            message: data.message || 'Incorrect OTP',
            attempts_remaining: data.attempts_remaining,
          },
          { status: 422 },
        );
      }

      if (status === 429) {
        return NextResponse.json({ message: data.message || 'Too many attempts' }, { status: 429 });
      }

      return NextResponse.json({ message: data.message || 'Verification failed' }, { status });
    }

    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
