import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { email } = await req.json();

    const response = await axios.post(`${process.env.API_BASE_URL}api/password/forgot`, {
      email,
    });

    // handle request
    if (response.status === 200) {
      const { success, message } = response.data;

      return NextResponse.json({ message, success }, { status: response.status });
    }
  } catch (error) {
    const message = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
    const status = error?.response?.status || 500;
    return NextResponse.json({ message, success: false }, { status });
  }
}
