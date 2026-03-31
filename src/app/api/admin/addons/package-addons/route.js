// /api/admin/addons/package-addons
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import axios from 'axios';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.access_token) {
      console.error('[API Route] No access token in session');
      return NextResponse.json({ success: false, data: [], error: 'Unauthorized' }, { status: 401 });
    }

    const api = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
    });

    const response = await api.get(`/api/admin/addons/list-package-addons`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in GET /api/admin/addons/package-addons:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Failed to fetch package addons' }, { status: 500 });
  }
}
