'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error locally in the browser console
    console.error('[SwayHouse Error Boundary]', error);

    // Send the error details to the server console (e.g., Vercel Realtime Logs)
    const reportError = async () => {
      try {
        await fetch('/api/error-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error?.message || String(error),
            stack: error?.stack || '',
            digest: error?.digest || '',
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          }),
        });
      } catch (err) {
        console.error('Failed to report client-side error to server:', err);
      }
    };

    reportError();
  }, [error]);

  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-5 text-xl">
          ⚠️
        </div>
        <h2 className="font-inter text-lg font-bold text-near-black mb-2 tracking-tight">
          Something went wrong
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed mb-6">
          We hit an unexpected error loading this page. Please try refreshing — if the problem persists, reach out to us.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-near-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-95"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="px-6 py-2.5 rounded-full border border-near-black/10 text-near-black text-[10px] font-bold uppercase tracking-wider hover:border-coral/20 transition-all active:scale-95"
          >
            Go Home
          </Link>
        </div>
        <p className="text-[9px] text-neutral-300 mt-10 uppercase font-bold tracking-widest">
          SwayHouse
        </p>
      </div>
    </div>
  );
}
