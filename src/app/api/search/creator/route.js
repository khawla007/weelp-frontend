import { NextResponse } from 'next/server';
import { fakeData } from '@/app/Data/ShopData';

export async function POST(req) {
  try {
    // Parse the request body
    const { query } = await req.json();

    // Find all items that include the query string in their name
    const resultitems = fakeData.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

    if (resultitems.length === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Items found', items: resultitems }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);

    // Return an error response
    return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
  }
}
