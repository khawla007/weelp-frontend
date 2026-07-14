// /api/payments/create-intent

import { NextResponse } from 'next/server';
import { createAuthenticatedServerApi } from '@/lib/axiosInstance';

export async function POST(req) {
  try {
    const data = await req.json();
    const selection = {
      order_type: data?.order_type,
      orderable_id: data?.orderable_id,
      travel_date: data?.travel_date,
      preferred_time: data?.preferred_time,
      number_of_adults: data?.number_of_adults,
      number_of_children: data?.number_of_children,
      variation_id: data?.variation_id,
      addon_ids: data?.addon_ids,
      bag_count: data?.bag_count,
      waiting_minutes: data?.waiting_minutes,
      currency: data?.currency,
    };

    const api = await createAuthenticatedServerApi();
    const response = await api.post('/api/stripe/initialize-payment', selection);

    return NextResponse.json(response.data);
  } catch (error) {
    const status = error?.response?.status;

    if (status === 401) {
      return NextResponse.json({ success: false, error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }

    if (status === 404) {
      return NextResponse.json({ success: false, error: 'The selected booking is no longer available.' }, { status: 404 });
    }

    if (status === 422) {
      return NextResponse.json({ success: false, error: 'The booking details could not be priced. Please review your selection.' }, { status: 422 });
    }

    return NextResponse.json({ success: false, error: 'Checkout could not be prepared. Please try again.' }, { status: 500 });
  }
}
