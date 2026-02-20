import { NextResponse } from 'next/server';
import { getItemsByRegion } from '@/lib/services/region';
import { log } from '@/lib/utils';

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const region = searchParams.get('region') || 'asia';

  const categories = searchParams.get('categories');

  // Check if "categories" param is empty and delete it from searchParams
  if (categories === null || categories === 'undefined') {
    searchParams.delete('categories');
  }

  // Rebuild query string without "region"
  searchParams.delete('region');
  const query = searchParams.toString();

  try {
    const data = await getItemsByRegion(region, query ? `?${query}` : '');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch region items' }, { status: 500 });
  }
}
