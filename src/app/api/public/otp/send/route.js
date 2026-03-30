import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/send-otp`, body);

    if (response.status >= 200 && response.status < 300) {
      return NextResponse.json(response.data, { status: response.status });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { response } = error;
      const { status, data } = response;

      if (status === 422) {
        return NextResponse.json(
          {
            error: data.message || 'Validation error',
            message: data.errors ? Object.values(data.errors).flat().join(', ') : 'Validation failed',
            errors: data.errors,
          },
          { status: 422 },
        );
      }

      if (status === 429) {
        return NextResponse.json(
          {
            error: data.message || 'Too many requests',
            retry_after: data.retry_after,
          },
          { status: 429 },
        );
      }

      return NextResponse.json({ message: data.message || 'An error occurred' }, { status });
    }

    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
