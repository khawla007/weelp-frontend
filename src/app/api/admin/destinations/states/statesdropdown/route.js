// app/api/admin/destinations/countries/statesdropdown/route.js
import { getStatesOptionsAdmin } from '@/lib/services/state';
export async function GET(req) {
  try {
    const data = await getStatesOptionsAdmin();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
