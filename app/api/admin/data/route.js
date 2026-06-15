import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const adminSession = req.cookies.get('swayhouse_admin_session')?.value;

    if (adminSession !== 'swayhouse_authorized_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Contact Submissions (ordered by latest)
    const { data: contacts, error: contactsErr } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactsErr) console.error('Error fetching contacts:', contactsErr);

    // 2. Fetch Chat Messages (ordered by latest)
    const { data: chats, error: chatsErr } = await supabase
      .from('swayai_chat_messages')
      .select('*')
      .order('created_at', { ascending: true }); // ascending groups chronological threads correctly

    if (chatsErr) console.error('Error fetching chats:', chatsErr);

    // 3. Fetch Pageviews (ordered by latest)
    const { data: pageviews, error: pageviewsErr } = await supabase
      .from('analytics_pageviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (pageviewsErr) console.error('Error fetching pageviews:', pageviewsErr);

    return NextResponse.json({
      contacts: contacts || [],
      chats: chats || [],
      pageviews: pageviews || [],
      errors: {
        contacts: contactsErr ? contactsErr.message : null,
        chats: chatsErr ? chatsErr.message : null,
        pageviews: pageviewsErr ? pageviewsErr.message : null
      }
    });
  } catch (err) {
    console.error('Admin Data API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
