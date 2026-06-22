import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const spaceId = req.cookies.get('swayhouse_space_session')?.value;

    if (!spaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('personal_grids')
      .select('*')
      .eq('id', spaceId)
      .single();

    if (error || !profile) {
      console.error('Error fetching space profile:', error);
      return NextResponse.json({ error: 'Space profile not found' }, { status: 404 });
    }

    // Exclude password from response
    const { password, ...safeProfile } = profile;

    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (err) {
    console.error('Space Profile GET API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const spaceId = req.cookies.get('swayhouse_space_session')?.value;

    if (!spaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, age, location, instagram, niche, bio, message, images } = body;

    if (!name || !instagram || !niche) {
      return NextResponse.json({ error: 'Name, Instagram, and Niche are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('personal_grids')
      .update({
        name,
        age: parseInt(age) || 0,
        location,
        instagram,
        niche,
        bio,
        message,
        images
      })
      .eq('id', spaceId);

    if (error) {
      console.error('Error updating space profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Space Profile POST API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
