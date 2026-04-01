import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 1;

  try {
    const res = await fetch(`${process.env.API_BASE_URL}api/posts?page=${page}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ data: [], last_page: 1 }, { status: 500 });
  }
}
