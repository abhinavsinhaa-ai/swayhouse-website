import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, username, password } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('swayhouse_space_session', '', {
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

    // Query database for personal space matching id and password
    const { data: space, error } = await supabase
      .from('personal_grids')
      .select('id, name')
      .ilike('id', username.trim())
      .eq('password', password)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[SPACE AUTH FAILED] Invalid credentials for:', username);
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }
      console.error('[DATABASE ERROR] Supabase query error:', error);
      return NextResponse.json({ 
        error: `Database setup required: ${error.message}. Please verify that the "personal_grids" table is created in your Supabase dashboard by running the SQL script.` 
      }, { status: 500 });
    }

    if (!space) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Successful login, set session cookie
    const response = NextResponse.json({ 
      success: true, 
      spaceId: space.id,
      name: space.name
    });

    response.cookies.set('swayhouse_space_session', space.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Space Auth API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
