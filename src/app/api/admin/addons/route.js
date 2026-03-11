// app/api/admin/addons/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import axios from 'axios';

export async function GET(req) {
  try {
    // Get session explicitly for server-side
    const session = await auth();

    if (!session?.access_token) {
      console.error('[API Route] No access token in session');
      return NextResponse.json({ success: false, data: [], error: 'Unauthorized' }, { status: 401 });
    }

    // Make API call with explicit token
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    });

    const query = req.nextUrl.search || '';
    const response = await api.get(`/api/admin/addons${query}`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in GET /api/admin/addons:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Failed to fetch add-ons' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.access_token) {
      console.error('[API Route] No access token in session');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    });

    const response = await api.post('/api/admin/addons/', body);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in POST /api/admin/addons:', error?.response?.data || error?.message || error);

    // Forward validation errors with proper status
    if (error?.response?.status === 422) {
      return NextResponse.json({
        success: false,
        message: error.response.data?.message || 'Validation failed',
        errors: error.response.data?.errors
      }, { status: 422 });
    }

    return NextResponse.json({
      success: false,
      message: error?.response?.data?.message || 'Failed to create add-on'
    }, { status: error?.response?.status || 500 });
  }
}
