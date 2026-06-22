import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, username, password } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('swayhouse_creator_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0, // Delete cookie immediately
      });
      return response;
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Query database for creator matching id and password
    const { data: creator, error } = await supabase
      .from('creator_profiles')
      .select('id, name')
      .ilike('id', username.trim())
      .eq('password', password)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[AUTH FAILED] Invalid credentials for:', username);
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }
      console.error('[DATABASE ERROR] Supabase query error:', error);
      return NextResponse.json({ 
        error: `Database setup required: ${error.message}. Please verify that the "creator_profiles" table is created in your Supabase dashboard by running the SQL script.` 
      }, { status: 500 });
    }

    if (!creator) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Successful login, set session cookie
    const response = NextResponse.json({ 
      success: true, 
      creatorId: creator.id,
      name: creator.name
    });

    response.cookies.set('swayhouse_creator_session', creator.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Creator Auth API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
