import { auth } from '@/lib/auth/auth';
import axios from 'axios';

export async function GET() {
  try {
    const session = await auth();

    // Test calling backend with the token from session
    const api = axios.create({
      baseURL: `${process.env.API_BASE_URL}`,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    });

    const response = await api.get('/api/admin/countries/10', {
      headers: { Accept: 'application/json' },
    });

    return Response.json({
      success: true,
      status: response.status,
      countryName: response.data?.name,
      hasData: !!response.data,
      keys: Object.keys(response.data || {}),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
      { status: 200 },
    );
  }
}
