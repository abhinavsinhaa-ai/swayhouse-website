import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, stack, url, userAgent, digest } = body;

    console.error('=== CLIENT-SIDE EXCEPTION CAPTURED ===');
    console.error('URL:', url || 'Unknown URL');
    console.error('User-Agent:', userAgent || 'Unknown User-Agent');
    console.error('Digest:', digest || 'No digest');
    console.error('Error Message:', message || 'No message');
    console.error('Stack Trace:\n', stack || 'No stack trace');
    console.error('======================================');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to log client error:', err);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
