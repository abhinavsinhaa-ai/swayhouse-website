'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function ContactForm() {
  const [type, setType] = useState('Creator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !instagram || !message) return;

    setStatus('loading');

    // 1. Try to log submission to Supabase database (non-blocking for Formspree)
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        type,
        name,
        email,
        instagram,
        message
      });
      if (error) {
        console.error('Error logging to Supabase:', error);
      } else {
        console.log('Successfully logged submission to Supabase.');
      }
    } catch (dbErr) {
      console.error('Supabase submission exception:', dbErr);
    }

    // 2. Submit to Formspree for email notification
    try {
      const response = await fetch('https://formspree.io/f/xgobnoeg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type,
          name,
          email,
          instagram,
          message
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      setStatus('success');
      // Reset form fields
      setName('');
      setEmail('');
      setInstagram('');
      setMessage('');
    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="relative w-full bg-coral border-none rounded-2xl p-8 md:p-10 shadow-2xl min-h-[500px] flex flex-col justify-between transition-all duration-300">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col items-center justify-center text-center py-16"
          >
            <div className="w-16 h-16 bg-white text-coral rounded-full flex items-center justify-center mb-6 shadow-md">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-cormorant text-white text-3xl font-semibold mb-4">
              Thank you for reaching out.
            </h3>
            <p className="text-sm text-white/80 max-w-sm">
              Our team will get back to you shortly.
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-8 text-xs font-bold uppercase tracking-wider text-white hover:text-white/80 border-b border-white transition-colors duration-200"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Type selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/80">I am a...</label>
              <div className="flex gap-3">
                {['Creator', 'Brand', 'Other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-3 text-sm font-semibold rounded-lg border transition-all duration-200 ${
                      type === t 
                        ? 'bg-white border-white text-coral shadow-[0_4px_12px_rgba(255,255,255,0.15)]'
                        : 'bg-transparent border-white/20 text-white hover:border-white/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5 relative group">
              <label htmlFor="formName" className="text-[10px] font-bold uppercase tracking-wider text-white/80">Your Name</label>
              <input 
                type="text" 
                id="formName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex" 
                required
                className="w-full bg-white text-near-black placeholder-neutral-400 focus:ring-2 focus:ring-near-black rounded-lg px-4 py-3 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 relative group">
              <label htmlFor="formEmail" className="text-[10px] font-bold uppercase tracking-wider text-white/80">Email Address</label>
              <input 
                type="email" 
                id="formEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required
                className="w-full bg-white text-near-black placeholder-neutral-400 focus:ring-2 focus:ring-near-black rounded-lg px-4 py-3 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Instagram Handle */}
            <div className="flex flex-col gap-1.5 relative group">
              <label htmlFor="formInstagram" className="text-[10px] font-bold uppercase tracking-wider text-white/80">Instagram Handle</label>
              <input 
                type="text" 
                id="formInstagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="e.g. swayhousehq" 
                required
                className="w-full bg-white text-near-black placeholder-neutral-400 focus:ring-2 focus:ring-near-black rounded-lg px-4 py-3 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5 relative group">
              <label htmlFor="formMessage" className="text-[10px] font-bold uppercase tracking-wider text-white/80">Your Message</label>
              <textarea 
                id="formMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your goals..." 
                required
                rows={4}
                className="w-full bg-white text-near-black placeholder-neutral-400 focus:ring-2 focus:ring-near-black rounded-lg px-4 py-3 text-sm outline-none resize-y transition-all duration-300"
              />
            </div>

            {/* Submit button with hover sweep */}
            <div className="mt-2 flex flex-col gap-4">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="relative self-start overflow-hidden px-10 py-4 rounded-full bg-near-black text-white text-sm font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-350 disabled:opacity-85 disabled:pointer-events-none group"
              >
                {/* Sweep backdrop */}
                <div className="absolute inset-0 bg-neutral-900 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10">
                  {status === 'loading' ? 'Sending...' : 'Send It'}
                </span>
              </button>

              {status === 'error' && (
                <p className="text-xs font-semibold text-white bg-red-600/30 p-2 rounded">
                  There was an error sending your message. Please try again.
                </p>
              )}

              <p className="text-[11px] text-white/70 leading-normal text-center mt-2">
                We will respond to you within 24 hours via mail or if you add your Instagram, we can respond to you there also and contact you there also or both.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
