// app/api/admin/destinations/countries/statesdropdown/route.js
import { getAllCitiesOptionsAdmin } from '@/lib/services/cities';

export async function GET(req) {
  try {
    const data = await getAllCitiesOptionsAdmin();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
