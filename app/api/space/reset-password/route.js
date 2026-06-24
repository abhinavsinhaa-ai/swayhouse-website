import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, username, otp, newPassword } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanId = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Fetch space profile from database
    const { data: space, error: fetchError } = await supabase
      .from('personal_grids')
      .select('id, name, message')
      .eq('id', cleanId)
      .maybeSingle();

    if (fetchError || !space) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    if (action === 'request_otp') {
      // Parse email from message field
      const cleanMessage = space.message || '';
      let email = '';
      if (cleanMessage.includes('[contact:')) {
        const index = cleanMessage.indexOf('\n\n[contact:');
        if (index !== -1) {
          const marker = cleanMessage.substring(index);
          const content = marker.replace('\n\n[contact:', '').replace(']', '');
          const parts = content.split('||');
          email = parts[0] || '';
        }
      }

      if (!email) {
        return NextResponse.json({ error: 'No registered email found for this account. Please contact admin.' }, { status: 400 });
      }

      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Clean existing OTP tokens if any from message field
      let cleanedMessage = space.message || '';
      if (cleanedMessage.includes('[otp:')) {
        const otpIdx = cleanedMessage.indexOf('\n\n[otp:');
        if (otpIdx !== -1) {
          cleanedMessage = cleanedMessage.substring(0, otpIdx);
        }
      }

      // Append new OTP token
      const updatedMessage = cleanedMessage + `\n\n[otp:${generatedOtp}||${expiry}]`;

      const { error: updateError } = await supabase
        .from('personal_grids')
        .update({ message: updatedMessage })
        .eq('id', cleanId);

      if (updateError) {
        console.error('Error saving OTP to Supabase:', updateError);
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
      }

      console.log(`[MOCK EMAIL] Sent password reset OTP "${generatedOtp}" to ${email}`);

      return NextResponse.json({ 
        success: true, 
        email: email.replace(/(?<=.{2}).(?=[^@]*?.@)/g, '*'), // Mask email for privacy
        otp: generatedOtp // Return OTP directly for easy local testing
      });
    }

    if (action === 'reset_password') {
      if (!otp || !newPassword) {
        return NextResponse.json({ error: 'OTP and New Password are required' }, { status: 400 });
      }

      // Parse OTP and expiry from message field
      const cleanMessage = space.message || '';
      let savedOtp = '';
      let expiry = 0;
      
      if (cleanMessage.includes('[otp:')) {
        const index = cleanMessage.indexOf('\n\n[otp:');
        if (index !== -1) {
          const marker = cleanMessage.substring(index);
          const content = marker.replace('\n\n[otp:', '').replace(']', '');
          const parts = content.split('||');
          savedOtp = parts[0] || '';
          expiry = parseInt(parts[1]) || 0;
        }
      }

      if (!savedOtp || Date.now() > expiry) {
        return NextResponse.json({ error: 'OTP has expired or does not exist. Please request a new one.' }, { status: 400 });
      }

      if (otp.trim() !== savedOtp) {
        return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
      }

      // Hash the new password using SHA-256
      const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

      // Remove the OTP token from message
      let cleanedMessage = space.message || '';
      if (cleanedMessage.includes('[otp:')) {
        const otpIdx = cleanedMessage.indexOf('\n\n[otp:');
        if (otpIdx !== -1) {
          cleanedMessage = cleanedMessage.substring(0, otpIdx);
        }
      }

      const { error: updateError } = await supabase
        .from('personal_grids')
        .update({ 
          password: hashedPassword,
          message: cleanedMessage
        })
        .eq('id', cleanId);

      if (updateError) {
        console.error('Error updating password in Supabase:', updateError);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Reset Password API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
