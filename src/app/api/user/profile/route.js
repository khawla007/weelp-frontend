import { auth } from '@/lib/auth/auth';

export async function GET() {
  const session = await auth();

  if (!session?.access_token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_BASE_URL}api/user/profile`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
