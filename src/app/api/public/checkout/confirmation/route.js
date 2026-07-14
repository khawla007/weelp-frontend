import { NextResponse } from 'next/server';

import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

const VALID_SESSION_ID = /^cs_[A-Za-z0-9_]+$/;

function safeError(status) {
  if (status === 401) return { status, error: 'Authentication required' };
  if (status === 404) return { status, error: 'Payment confirmation not found' };
  if (status === 400 || status === 422) return { status, error: 'Invalid payment confirmation' };
  return { status: 500, error: 'Unable to verify payment' };
}

export async function POST(request) {
  let sessionId;
  try {
    const body = await request.json();
    sessionId = body?.session_id;
  } catch {
    return NextResponse.json({ error: 'Invalid payment confirmation' }, { status: 400 });
  }

  if (typeof sessionId !== 'string' || !VALID_SESSION_ID.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid payment confirmation' }, { status: 400 });
  }

  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.post('/api/confirm-payment', { session_id: sessionId });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const safe = safeError(error?.response?.status);
    return NextResponse.json({ error: safe.error }, { status: safe.status });
  }
}
