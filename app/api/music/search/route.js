import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get('term');
    if (!term) {
      return NextResponse.json({ results: [] });
    }

    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=15`);
    
    if (!res.ok) {
      throw new Error(`iTunes API responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('iTunes Search API proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch music search results', details: err.message }, { status: 500 });
  }
}
