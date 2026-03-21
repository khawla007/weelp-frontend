// app/api/admin/addons/[id]/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import axios from 'axios';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session?.access_token) {
      console.error('[API Route] No access token in session');
      return NextResponse.json({ success: false, data: {}, error: 'Unauthorized' }, { status: 401 });
    }

    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    });

    const response = await api.get(`/api/admin/addons/${id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in GET /api/admin/addons/[id]:', error?.message || error);

    // Handle 404 from backend
    if (error?.response?.status === 404) {
      return NextResponse.json({ success: false, data: {} }, { status: 404 });
    }

    return NextResponse.json({ success: false, message: 'Failed to fetch add-on' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
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

    const response = await api.put(`/api/admin/addons/${id}`, body);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in PUT /api/admin/addons/[id]:', error?.response?.data || error?.message || error);

    // Forward validation errors with proper status
    if (error?.response?.status === 422) {
      return NextResponse.json(
        {
          success: false,
          message: error.response.data?.message || 'Validation failed',
          errors: error.response.data?.errors,
        },
        { status: 422 },
      );
    }

    // Handle 404 from backend
    if (error?.response?.status === 404) {
      return NextResponse.json({ success: false, message: 'Add-on not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.response?.data?.message || 'Failed to update add-on',
      },
      { status: error?.response?.status || 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session?.access_token) {
      console.error('[API Route] No access token in session');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    });

    const response = await api.delete(`/api/admin/addons/${id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in DELETE /api/admin/addons/[id]:', error?.response?.data || error?.message || error);

    // Handle 404 from backend
    if (error?.response?.status === 404) {
      return NextResponse.json({ success: false, message: 'Add-on not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete add-on',
      },
      { status: error?.response?.status || 500 },
    );
  }
}
