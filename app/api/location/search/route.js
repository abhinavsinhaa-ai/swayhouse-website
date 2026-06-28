import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Fetch from Nominatim OpenStreetMap
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SwayHouse/1.0 (hello@swayhouse.in)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`Nominatim status ${res.status}`);
    }

    const data = await res.json();
    
    const results = data.map((item) => {
      const address = item.address;
      const name = item.display_name;
      
      const parts = [];
      // Prefer city/suburb names for an aesthetic short tag
      if (address.suburb || address.neighbourhood) {
        parts.push(address.suburb || address.neighbourhood);
      }
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      if (address.state) {
        parts.push(address.state);
      }
      if (address.country) {
        parts.push(address.country);
      }
      
      const formatted = parts.length > 0 ? parts.join(', ') : name;
      return {
        formatted,
        lat: item.lat,
        lon: item.lon,
        name: item.name
      };
    });

    // Remove duplicates
    const uniqueResults = [];
    const seen = new Set();
    for (const r of results) {
      if (!seen.has(r.formatted)) {
        seen.add(r.formatted);
        uniqueResults.push(r);
      }
    }

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error('Location search API error:', error);
    
    // Offline / rate-limit mock fallback
    const query = new URL(req.url).searchParams.get('q')?.toLowerCase() || '';
    const mockLocations = [
      'Bandra West, Mumbai',
      'Indiranagar, Bengaluru',
      'Hauz Khas, New Delhi',
      'Jubilee Hills, Hyderabad',
      'Koregaon Park, Pune',
      'Anjuna, Goa',
      'Salt Lake, Kolkata',
      'Beverly Hills, Los Angeles',
      'Soho, New York',
      'Mayfair, London',
      'Shibuya, Tokyo',
      'Dubai Marina, Dubai',
      'Downtown, Singapore',
      'Marina Bay, Singapore'
    ];
    
    const filtered = mockLocations
      .filter(loc => loc.toLowerCase().includes(query))
      .map(formatted => ({ formatted }));
      
    return NextResponse.json({ results: filtered });
  }
}
