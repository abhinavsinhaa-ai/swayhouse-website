'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreatorLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/creators/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to creator portal
        router.push('/creators/portal');
      } else {
        setError(data.error || 'Incorrect username or password');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#FBF9F6] px-6 relative selection:bg-coral selection:text-white">
      {/* Subtle Noise overlay */}
      <div className="noise-bg opacity-[0.02] pointer-events-none fixed inset-0 z-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] bg-white border border-near-black/5 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center relative z-10"
      >
        {/* Brand Link Logo */}
        <Link href="/" className="flex items-center gap-2 logo-element group mb-8">
          <svg className="w-6 h-5.5 text-coral" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 32 V19 L20 11 L28 19 V32 H12 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
            <path d="M3 24 C 13 13, 27 33, 37 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
          <span className="font-inter text-xs font-extrabold tracking-tight text-near-black">SwayHouse</span>
        </Link>

        <div className="w-10 h-10 rounded-full bg-coral/10 text-coral flex items-center justify-center mb-4">
          <Lock className="w-4.5 h-4.5" />
        </div>

        <h2 className="font-cormorant text-2xl font-bold text-near-black text-center mb-1">Creator Portal</h2>
        <p className="text-[11px] text-neutral-400 text-center mb-8 uppercase tracking-widest font-semibold">
          Manage your portfolio & profile
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Creator Username</label>
            <input
              type="text"
              placeholder="e.g. aditi"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Entering...' : 'Access Portal'}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 text-center mt-2 flex items-center gap-2 justify-center"
            >
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </motion.p>
          )}
        </form>

        <span className="text-[9px] text-neutral-400 uppercase tracking-widest mt-10">
          Intentionally small. Exceptionally managed.
        </span>
      </motion.div>
    </main>
  );
}
