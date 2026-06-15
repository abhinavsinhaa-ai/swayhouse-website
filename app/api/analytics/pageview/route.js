import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

const COUNTRY_NAMES = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  JP: 'Japan',
  HK: 'Hong Kong',
  IE: 'Ireland',
  CH: 'Switzerland'
};

function parseUserAgent(ua) {
  if (!ua) return { device: 'Desktop', os: 'Unknown' };

  let device = 'Desktop';
  let os = 'Unknown';

  // Device type detection
  const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|webos/i.test(ua);
  const isTablet = /ipad|tablet|playbook|silk/i.test(ua);
  
  if (isTablet) {
    device = 'Tablet';
  } else if (isMobile) {
    device = 'Mobile';
  }

  // OS detection
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  return { device, os };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { visitor_id, path, referrer, user_agent } = body;

    if (!visitor_id || !path) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Extract geography headers from Vercel edge routers
    const countryCode = req.headers.get('x-vercel-ip-country') || '';
    const cityHeader = req.headers.get('x-vercel-ip-city') || '';
    
    let city = 'Unknown';
    if (cityHeader) {
      try {
        city = decodeURIComponent(cityHeader);
      } catch (e) {
        city = cityHeader;
      }
    }
    
    const country = COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode || 'Local/Development';

    // 2. Parse browser user agent
    const ua = user_agent || req.headers.get('user-agent') || '';
    const { device, os } = parseUserAgent(ua);

    // 3. Log to Supabase database
    const { error } = await supabase.from('analytics_pageviews').insert({
      visitor_id,
      path,
      referrer: referrer || 'Direct',
      user_agent: ua,
      device_type: device,
      os,
      country,
      city
    });

    if (error) {
      console.error('Error logging pageview to Supabase:', error);
      return NextResponse.json({ error: 'Database logging failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analytics pageview logger error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
