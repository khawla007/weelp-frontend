import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, password, password_confirmation } = await req.json();

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/password/reset`, { password, token, password_confirmation });

    const { message } = response.data;

    return NextResponse.json({ message: message || 'Password has been reset successfully.' }, { status: response.status });
  } catch (error) {
    const message = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
    return NextResponse.json({ message }, { status: error?.response?.status || 500 });
  }
}
