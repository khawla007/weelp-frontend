// app/api/admin/destinations/cities/[id]/route.js
import { auth } from '@/lib/auth/auth';
import axios from 'axios';

export async function GET(req, { params }) {
  const { id } = await params;

  const session = await auth();
  const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {},
  });

  try {
    const response = await api.get(`/api/admin/cities/${id}`, {
      headers: { Accept: 'application/json' },
    });

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    }), { status: error.response?.status || 500 });
  }
}
