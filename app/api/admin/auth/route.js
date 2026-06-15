import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { passcode, action } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('swayhouse_admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      return response;
    }

    const correctPassword = process.env.ADMIN_PASSWORD || 'Devv9672310170';

    if (passcode === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('swayhouse_admin_session', 'swayhouse_authorized_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
  } catch (err) {
    console.error('Auth API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
