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
    const parsedDates = [];
    const parsedMusicTracks = [];
    const parsedMusicArtists = [];
    const parsedMusicPreviews = [];
    const parsedMusicOffsets = [];
    const parsedLocations = [];
    if (profile.images) {
      profile.images.forEach((img, idx) => {
        if (img && img.includes('||')) {
          const parts = img.split('||');
          cleanImages.push(parts[0]);
          parsedCaptions.push(parts[1] || '');
          parsedDates.push(parts[2] || '');
          parsedMusicTracks.push(parts[3] || '');
          parsedMusicArtists.push(parts[4] || '');
          parsedMusicPreviews.push(parts[5] || '');
          parsedMusicOffsets.push(parts[6] || '0');
          parsedLocations.push(parts[7] || '');
        } else {
          cleanImages.push(img);
          parsedCaptions.push((profile.captions && profile.captions[idx]) || '');
          parsedDates.push('');
          parsedMusicTracks.push('');
          parsedMusicArtists.push('');
          parsedMusicPreviews.push('');
          parsedMusicOffsets.push('0');
          parsedLocations.push('');
        }
      });
    }
    profile.images = cleanImages;
    profile.captions = parsedCaptions;
    profile.dates = parsedDates;
    profile.musicTracks = parsedMusicTracks;
    profile.musicArtists = parsedMusicArtists;
    profile.musicPreviews = parsedMusicPreviews;
    profile.musicOffsets = parsedMusicOffsets;
    profile.locations = parsedLocations;

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

    let cleanMessage = profile.message || '';
    let email = '';
    let phone = '';
    
    // Extract OTP if present (and clean it from message)
    if (cleanMessage.includes('[otp:')) {
      const otpIndex = cleanMessage.indexOf('\n\n[otp:');
      if (otpIndex !== -1) {
        cleanMessage = cleanMessage.substring(0, otpIndex);
      }
    }

    // Extract Contact Info
    if (cleanMessage.includes('[contact:')) {
      const index = cleanMessage.indexOf('\n\n[contact:');
      if (index !== -1) {
        const marker = cleanMessage.substring(index);
        cleanMessage = cleanMessage.substring(0, index);
        const content = marker.replace('\n\n[contact:', '').replace(']', '');
        const parts = content.split('||');
        email = parts[0] || '';
        phone = parts[1] || '';
      }
    }
    profile.message = cleanMessage;
    profile.email = email;
    profile.phone = phone;

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
    const { name, age, location, instagram, niche, bio, message, images, gender, captions, dates, musicTracks, musicArtists, musicPreviews, musicOffsets, locations, designation, email, phone } = body;

    if (!name || !instagram || !niche) {
      return NextResponse.json({ error: 'Name, Instagram, and Niche are required' }, { status: 400 });
    }

    const mergedImages = [];
    if (images) {
      images.forEach((img, idx) => {
        const caption = (captions && captions[idx]) || '';
        const date = (dates && dates[idx]) || '';
        const track = (musicTracks && musicTracks[idx]) || '';
        const artist = (musicArtists && musicArtists[idx]) || '';
        const preview = (musicPreviews && musicPreviews[idx]) || '';
        const offset = (musicOffsets && musicOffsets[idx]) || '0';
        const loc = (locations && locations[idx]) || '';

        if (caption || date || track || artist || preview || offset !== '0' || loc) {
          mergedImages.push(`${img}||${caption}||${date}||${track}||${artist}||${preview}||${offset}||${loc}`);
        } else {
          mergedImages.push(img);
        }
      });
    }

    const mergedNiche = designation ? `${niche}||${designation}` : niche;

    // Fetch the existing profile to extract the contact marker and OTP marker
    const { data: existingProfile } = await supabase
      .from('personal_grids')
      .select('message')
      .eq('id', spaceId)
      .single();

    let contactEmail = email !== undefined ? email : '';
    let contactPhone = phone !== undefined ? phone : '';
    let otpMarker = '';

    if (existingProfile && existingProfile.message) {
      const msg = existingProfile.message;
      
      // Keep existing OTP marker if present
      if (msg.includes('[otp:')) {
        const otpIdx = msg.indexOf('\n\n[otp:');
        if (otpIdx !== -1) {
          otpMarker = msg.substring(otpIdx);
        }
      }

      // If email/phone are undefined in body, load them from existing message
      if (email === undefined && phone === undefined) {
        if (msg.includes('[contact:')) {
          const contactIdx = msg.indexOf('\n\n[contact:');
          if (contactIdx !== -1) {
            const marker = msg.substring(contactIdx);
            const content = marker.split('\n\n[otp:')[0].replace('\n\n[contact:', '').replace(']', '');
            const parts = content.split('||');
            contactEmail = parts[0] || '';
            contactPhone = parts[1] || '';
          }
        }
      }
    }

    const contactMarker = `\n\n[contact:${contactEmail || ''}||${contactPhone || ''}]`;
    const mergedMessage = (message || '') + contactMarker + otpMarker;

    const updateObj = {
      name,
      age: parseInt(age) || 0,
      location,
      instagram,
      niche: mergedNiche,
      bio,
      message: mergedMessage,
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
