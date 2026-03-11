// app/api/admin/destinations/states/[id]/route.js
import { getSingleStateAdmin } from '@/lib/services/state';

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const state = await getSingleStateAdmin(id);
    return new Response(JSON.stringify(state), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
