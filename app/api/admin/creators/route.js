import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

// Helper to check admin authorization
function checkAuth(req) {
  const adminSession = req.cookies.get('swayhouse_admin_session')?.value;
  return adminSession === 'swayhouse_authorized_admin';
}

export async function GET(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch roster creators
    const { data: creators, error: creatorError } = await supabase
      .from('creator_profiles')
      .select('id, name, age, location, instagram, niche, bio, message, images, created_at')
      .order('created_at', { ascending: false });

    if (creatorError) {
      console.error('Error fetching creators from Supabase:', creatorError);
      return NextResponse.json({ error: creatorError.message }, { status: 500 });
    }

    // Fetch space profiles (personal grids)
    const { data: spaces, error: spaceError } = await supabase
      .from('personal_grids')
      .select('id, name, age, location, instagram, niche, bio, message, images, created_at')
      .order('created_at', { ascending: false });

    if (spaceError) {
      console.error('Error fetching spaces from Supabase:', spaceError);
      return NextResponse.json({ error: spaceError.message }, { status: 500 });
    }

    // Map profiles with Virtual is_space flags and combine them
    const formattedCreators = (creators || []).map(c => ({ ...c, is_space: false }));
    const formattedSpaces = (spaces || []).map(s => ({ ...s, is_space: true }));

    const combined = [...formattedCreators, ...formattedSpaces].sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return NextResponse.json({ success: true, creators: combined });
  } catch (err) {
    console.error('Admin Creators GET API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, password, isSpace } = body;

    if (!id || !name || !password) {
      return NextResponse.json({ error: 'Username (ID), Display Name, and Password are required' }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!cleanId) {
      return NextResponse.json({ error: 'Invalid Username. Only lowercase letters, numbers, hyphens, and underscores are allowed.' }, { status: 400 });
    }

    const targetTable = isSpace ? 'personal_grids' : 'creator_profiles';
    const insertObj = {
      id: cleanId,
      name: name.trim(),
      password: password.trim(),
      age: 18,
      location: isSpace ? 'Mumbai, India' : 'Bangalore, India',
      instagram: cleanId, // default instagram to username
      niche: isSpace ? 'Lifestyle & Aesthetics' : 'Lifestyle & Feel Good',
      bio: isSpace 
        ? ''
        : `I'm passionate about creating content that inspires, connects, and adds value to everyday life.`,
      message: isSpace
        ? `Hii I'm ${name.trim()} 🤍\n\nWelcome to my space. Lost in aesthetic corners, quiet moments, and visual inspirations.`
        : `Hii I'm ${name.trim()} 🤍\n\nWelcome to my space. I'm excited to share my journey, interests, and milestones with you here.`,
      images: [] // Empty gallery initially
    };

    if (isSpace) {
      insertObj.gender = 'prefer_not_to_say';
    }

    // Insert new profile row into the designated table
    let { error } = await supabase
      .from(targetTable)
      .insert(insertObj);

    if (error) {
      // Retry without gender if the column is missing in the database
      if (isSpace && error.message && (error.message.includes('column') || error.message.includes('does not exist') || error.code === '42703')) {
        console.warn('[DB WARNING] "gender" column might be missing. Retrying insert without "gender".');
        const { gender: _, ...safeInsertObj } = insertObj;
        const { error: retryError } = await supabase
          .from(targetTable)
          .insert(safeInsertObj);
        if (retryError) {
          console.error(`Error creating space in Supabase (retry):`, retryError);
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
      } else {
        console.error(`Error creating ${isSpace ? 'space' : 'creator'} in Supabase:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, creatorId: cleanId });
  } catch (err) {
    console.error('Admin Creators POST API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const isSpace = searchParams.get('is_space') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const targetTable = isSpace ? 'personal_grids' : 'creator_profiles';

    const { error } = await supabase
      .from(targetTable)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${targetTable} in Supabase:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin Creators DELETE API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

