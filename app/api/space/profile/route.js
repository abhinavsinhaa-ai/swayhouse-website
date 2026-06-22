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

    // Parse images and captions
    const cleanImages = [];
    const parsedCaptions = [];
    if (profile.images) {
      profile.images.forEach((img, idx) => {
        if (img && img.includes('||')) {
          const parts = img.split('||');
          cleanImages.push(parts[0]);
          parsedCaptions.push(parts[1] || '');
        } else {
          cleanImages.push(img);
          parsedCaptions.push((profile.captions && profile.captions[idx]) || '');
        }
      });
    }
    profile.images = cleanImages;
    profile.captions = parsedCaptions;

    let cleanNiche = '';
    let parsedDesignation = '';
    if (profile.niche) {
      if (profile.niche.includes('||')) {
        const parts = profile.niche.split('||');
        cleanNiche = parts[0];
        parsedDesignation = parts[1] || '';
      } else {
        cleanNiche = profile.niche;
        parsedDesignation = '';
      }
    }
    profile.niche = cleanNiche;
    profile.designation = parsedDesignation;

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
    const { name, age, location, instagram, niche, bio, message, images, gender, captions, designation } = body;

    if (!name || !instagram || !niche) {
      return NextResponse.json({ error: 'Name, Instagram, and Niche are required' }, { status: 400 });
    }

    const mergedImages = [];
    if (images) {
      images.forEach((img, idx) => {
        const caption = (captions && captions[idx]) || '';
        if (caption) {
          mergedImages.push(`${img}||${caption}`);
        } else {
          mergedImages.push(img);
        }
      });
    }

    const mergedNiche = designation ? `${niche}||${designation}` : niche;

    const updateObj = {
      name,
      age: parseInt(age) || 0,
      location,
      instagram,
      niche: mergedNiche,
      bio,
      message,
      images: mergedImages,
      gender,
      captions
    };

    let { error } = await supabase
      .from('personal_grids')
      .update(updateObj)
      .eq('id', spaceId);

    if (error) {
      // Retry without gender or captions if columns are missing in the database
      if (error.message && (error.message.includes('column') || error.message.includes('does not exist') || error.code === '42703')) {
        console.warn('[DB WARNING] Custom columns might be missing. Retrying update with base fields.');
        const { gender: _, captions: __, ...safeUpdateObj } = updateObj;
        const { error: retryError } = await supabase
          .from('personal_grids')
          .update(safeUpdateObj)
          .eq('id', spaceId);
        if (retryError) {
          console.error('Error updating space profile (retry):', retryError);
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
      } else {
        console.error('Error updating space profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Space Profile POST API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
