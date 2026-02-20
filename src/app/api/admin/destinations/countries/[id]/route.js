// app/api/admin/destinations/countries/[id]/route.js
import { getSingleCountryAdmin } from '@/lib/services/country';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const country = await getSingleCountryAdmin(id);
    return new Response(JSON.stringify(country), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
