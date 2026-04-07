import { auth } from '@/lib/auth/auth';

export async function POST(request) {
  const session = await auth();

  if (!session?.access_token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();

  const response = await fetch(`${process.env.API_BASE_URL}api/user/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function DELETE(request) {
  const session = await auth();

  if (!session?.access_token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_BASE_URL}api/user/avatar`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
