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

    const { data: creators, error } = await supabase
      .from('creator_profiles')
      .select('id, name, age, location, instagram, niche, bio, message, images')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creators from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, creators: creators || [] });
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
    const { id, name, password } = body;

    if (!id || !name || !password) {
      return NextResponse.json({ error: 'Username (ID), Display Name, and Password are required' }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!cleanId) {
      return NextResponse.json({ error: 'Invalid Username. Only lowercase letters, numbers, hyphens, and underscores are allowed.' }, { status: 400 });
    }

    // Insert new creator row
    const { error } = await supabase
      .from('creator_profiles')
      .insert({
        id: cleanId,
        name: name.trim(),
        password: password.trim(),
        age: 18,
        location: 'Bangalore, India',
        instagram: cleanId, // default instagram to username
        niche: 'Lifestyle & Feel Good',
        bio: `I'm passionate about creating content that inspires, connects, and adds value to everyday life.`,
        message: `Hii I'm ${name.trim()} 🤍\n\nWelcome to my space. I'm excited to share my journey, interests, and milestones with you here.`,
        images: [] // Empty gallery initially
      });

    if (error) {
      console.error('Error creating creator in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('creator_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting creator from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin Creators DELETE API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
