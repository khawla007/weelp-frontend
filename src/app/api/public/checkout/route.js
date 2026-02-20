import { publicApi } from '@/lib/axiosInstance';
import { NextResponse } from 'next/server';
import { log } from '@/lib/utils';

export async function POST(req) {
  try {
    const requestBody = await req.json();

    const response = await publicApi.post('/api/create-checkout-session', requestBody);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    log(error.response); // optional logging if you want
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
