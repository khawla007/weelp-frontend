import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const baseUrl = process.env.API_BASE_URL;

    const [activitiesRes, itinerariesRes, packagesRes] = await Promise.all([
      fetch(`${baseUrl}/api/activities?search=${encodeURIComponent(query)}&per_page=5`, {
        headers: { Accept: 'application/json' },
      }),
      fetch(`${baseUrl}/api/itineraries?search=${encodeURIComponent(query)}&per_page=5`, {
        headers: { Accept: 'application/json' },
      }),
      fetch(`${baseUrl}/api/packages?search=${encodeURIComponent(query)}&per_page=5`, {
        headers: { Accept: 'application/json' },
      }),
    ]);

    const [activities, itineraries, packages] = await Promise.all([activitiesRes.json(), itinerariesRes.json(), packagesRes.json()]);

    const results = [
      ...(activities?.data || []).map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        type: 'App\\Models\\Activity',
        type_label: 'Activity',
      })),
      ...(itineraries?.data || []).map((i) => ({
        id: i.id,
        name: i.name,
        slug: i.slug,
        type: 'App\\Models\\Itinerary',
        type_label: 'Itinerary',
      })),
      ...(packages?.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: 'App\\Models\\Package',
        type_label: 'Package',
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching items:', error);
    return NextResponse.json([]);
  }
}
