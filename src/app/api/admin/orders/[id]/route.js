import { NextResponse } from 'next/server';

import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

const SAFE_ERRORS = {
  401: 'Authentication required.',
  403: 'Forbidden.',
  404: 'Order not found.',
};

export async function GET(_request, { params }) {
  const { id } = await params;
  const numericId = Number(id);

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(numericId)) {
    return NextResponse.json({ success: false, message: 'Invalid order ID.' }, { status: 400 });
  }

  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/orders/${id}`);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const upstreamStatus = Number(error?.response?.status);
    const status = SAFE_ERRORS[upstreamStatus] ? upstreamStatus : 500;
    const message = SAFE_ERRORS[status] ?? 'We could not load this order.';
    return NextResponse.json({ success: false, message }, { status });
  }
}
