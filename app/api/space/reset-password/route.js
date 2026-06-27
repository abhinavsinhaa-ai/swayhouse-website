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
      // Parse email from message field using robust regex
      const cleanMessage = space.message || '';
      let email = '';
      const contactMatch = cleanMessage.match(/\[contact:([^\]]+)\]/);
      if (contactMatch) {
        const parts = contactMatch[1].split('||');
        email = parts[0] || '';
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

      // Send real email if RESEND_API_KEY is configured
      if (process.env.RESEND_API_KEY) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'SwaySpace <onboarding@resend.dev>',
              to: email,
              subject: 'SwaySpace Password Reset OTP',
              html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 18px; font-weight: bold; color: #1a1a1a;">SwayHouse</span>
                  </div>
                  <h3 style="color: #FF6B35; font-size: 20px; margin-bottom: 10px;">Reset Your Password</h3>
                  <p style="color: #666666; font-size: 14px; line-height: 1.5;">You requested to reset the password for your SwaySpace account. Use the 6-digit OTP code below to proceed:</p>
                  <div style="background-color: #FBF9F6; padding: 20px; border-radius: 8px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #1a1a1a; margin: 24px 0; border: 1px solid #efefef;">
                    ${generatedOtp}
                  </div>
                  <p style="color: #999999; font-size: 11px; line-height: 1.4; border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 20px;">
                    This code is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email.
                  </p>
                </div>
              `
            })
          });

          if (!emailResponse.ok) {
            const errText = await emailResponse.text();
            console.error('Failed to send email via Resend API:', errText);
            let parsedErr = errText;
            try {
              const errJson = JSON.parse(errText);
              parsedErr = errJson.message || errText;
            } catch (e) {}
            return NextResponse.json({ 
              error: `Email delivery failed: ${parsedErr}. Please check your Resend configuration.` 
            }, { status: 502 });
          } else {
            console.log(`Successfully sent real reset email to ${email} via Resend.`);
          }
        } catch (mailErr) {
          console.error('Error executing Resend email fetch:', mailErr);
          return NextResponse.json({ 
            error: `Failed to connect to Resend API: ${mailErr.message}` 
          }, { status: 502 });
        }
      } else {
        console.log(`[MOCK EMAIL] Sent password reset OTP "${generatedOtp}" to ${email}`);
      }

      return NextResponse.json({ 
        success: true, 
        email: email.replace(/(?<=.{2}).(?=[^@]*?.@)/g, '*') // Mask email for privacy
      });
    }

    if (action === 'verify_otp') {
      if (!otp) {
        return NextResponse.json({ error: 'OTP code is required' }, { status: 400 });
      }

      // Parse OTP and expiry from message field using robust regex
      const cleanMessage = space.message || '';
      let savedOtp = '';
      let expiry = 0;
      
      const otpMatch = cleanMessage.match(/\[otp:([^\]]+)\]/);
      if (otpMatch) {
        const parts = otpMatch[1].split('||');
        savedOtp = parts[0] || '';
        expiry = parseInt(parts[1]) || 0;
      }

      if (!savedOtp || Date.now() > expiry) {
        return NextResponse.json({ error: 'OTP has expired or does not exist. Please request a new one.' }, { status: 400 });
      }

      if (otp.trim() !== savedOtp) {
        return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reset_password') {
      if (!otp || !newPassword) {
        return NextResponse.json({ error: 'OTP and New Password are required' }, { status: 400 });
      }

      // Parse OTP and expiry from message field using robust regex
      const cleanMessage = space.message || '';
      let savedOtp = '';
      let expiry = 0;
      
      const otpMatch = cleanMessage.match(/\[otp:([^\]]+)\]/);
      if (otpMatch) {
        const parts = otpMatch[1].split('||');
        savedOtp = parts[0] || '';
        expiry = parseInt(parts[1]) || 0;
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
