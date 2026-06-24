import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, username, password } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, Username, and Password are required' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Either Email or Phone Number is required' }, { status: 400 });
    }

    const cleanId = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanId) {
      return NextResponse.json({ error: 'Invalid Username. Only lowercase letters, numbers, hyphens, and underscores are allowed.' }, { status: 400 });
    }

    // Check if username already exists in personal_grids
    const { data: existingSpace } = await supabase
      .from('personal_grids')
      .select('id')
      .ilike('id', cleanId)
      .maybeSingle();

    if (existingSpace) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Also check creator_profiles to avoid conflicts
    const { data: existingCreator } = await supabase
      .from('creator_profiles')
      .select('id')
      .ilike('id', cleanId)
      .maybeSingle();

    if (existingCreator) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Hash the password using built-in SHA-256
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Build the contact marker inside the message field
    const contactMarker = `\n\n[contact:${email || ''}||${phone || ''}]`;
    const defaultMessage = `Hii I'm ${name.trim()} 🤍\n\nWelcome to my space. Lost in aesthetic corners, quiet moments, and visual inspirations.`;

    const insertObj = {
      id: cleanId,
      name: name.trim(),
      password: hashedPassword,
      age: 18,
      location: 'Mumbai, India',
      instagram: cleanId,
      niche: 'Lifestyle & Aesthetics',
      bio: '',
      message: defaultMessage + contactMarker,
      images: [],
      gender: 'prefer_not_to_say'
    };

    let { error } = await supabase
      .from('personal_grids')
      .insert(insertObj);

    if (error) {
      // Retry without gender if the column is missing in the database
      if (error.message && (error.message.includes('column') || error.message.includes('does not exist') || error.code === '42703')) {
        console.warn('[DB WARNING] "gender" column might be missing. Retrying insert without "gender".');
        const { gender: _, ...safeInsertObj } = insertObj;
        const { error: retryError } = await supabase
          .from('personal_grids')
          .insert(safeInsertObj);
        
        if (retryError) {
          console.error('Error creating space in Supabase (retry):', retryError);
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
      } else {
        console.error('Error creating space in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Successful registration, set session cookie
    const response = NextResponse.json({ 
      success: true, 
      spaceId: cleanId,
      name: name.trim()
    });

    response.cookies.set('swayhouse_space_session', cleanId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Signup API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
