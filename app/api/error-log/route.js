import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, stack, url, userAgent, digest } = body;

    // 1. Log to server console
    console.error('=== CLIENT-SIDE EXCEPTION CAPTURED ===');
    console.error('URL:', url || 'Unknown URL');
    console.error('User-Agent:', userAgent || 'Unknown User-Agent');
    console.error('Digest:', digest || 'No digest');
    console.error('Error Message:', message || 'No message');
    console.error('Stack Trace:\n', stack || 'No stack trace');
    console.error('======================================');

    // 2. Log to Supabase contact_submissions table as a backup channel
    try {
      const logMessage = `URL: ${url || 'Unknown'}\nUser-Agent: ${userAgent || 'Unknown'}\nDigest: ${digest || 'None'}\nError: ${message || 'No message'}\n\nStack:\n${stack || 'No stack'}`;
      
      await supabase.from('contact_submissions').insert({
        type: 'error_log',
        name: 'Client Exception',
        email: 'error@swayhouse.in',
        instagram: 'error_log',
        message: logMessage
      });
    } catch (dbErr) {
      console.error('Failed to log client error to Supabase:', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to log client error:', err);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
