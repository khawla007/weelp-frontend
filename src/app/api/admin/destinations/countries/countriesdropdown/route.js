// app/api/admin/destinations/countries/countriesdropdown/route.js
import { getCountriesOptionsAdmin } from '@/lib/services/country';

export async function GET(req) {
  try {
    const country = await getCountriesOptionsAdmin();
    return new Response(JSON.stringify(country), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
