import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const creatorId = req.cookies.get('swayhouse_creator_session')?.value;

    if (!creatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (error || !profile) {
      console.error('Error fetching creator profile:', error);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
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

    // Exclude password from response
    const { password, ...safeProfile } = profile;

    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (err) {
    console.error('Creator Profile GET API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const creatorId = req.cookies.get('swayhouse_creator_session')?.value;

    if (!creatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, age, location, instagram, niche, bio, message, images, captions } = body;

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

    const updateObj = {
      name,
      age: parseInt(age) || 0,
      location,
      instagram,
      niche,
      bio,
      message,
      images: mergedImages,
      captions
    };

    let { error } = await supabase
      .from('creator_profiles')
      .update(updateObj)
      .eq('id', creatorId);

    if (error) {
      // Retry without captions if the column is missing in the database
      if (error.message && (error.message.includes('column') || error.message.includes('does not exist') || error.code === '42703')) {
        console.warn('[DB WARNING] "captions" column might be missing. Retrying update without "captions".');
        const { captions: _, ...safeUpdateObj } = updateObj;
        const { error: retryError } = await supabase
          .from('creator_profiles')
          .update(safeUpdateObj)
          .eq('id', creatorId);
        if (retryError) {
          console.error('Error updating creator profile (retry):', retryError);
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
      } else {
        console.error('Error updating creator profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Creator Profile POST API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
