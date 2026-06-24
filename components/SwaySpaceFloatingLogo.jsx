'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function SwaySpaceFloatingLogo() {
  const [showCallout, setShowCallout] = useState(true);

  // Hide callout on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowCallout(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-6 bottom-6 md:top-24 md:right-6 z-[999] select-none flex items-center gap-3 flex-row-reverse">
      <Link
        href="/space/login"
        onClick={() => setShowCallout(false)}
        className="swayspace-trigger-btn flex items-center justify-center w-12 h-12 rounded-full bg-white border border-near-black/5 text-coral shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(255,107,53,0.2)] hover:scale-105 hover:border-coral/20 active:scale-95 transition-all duration-300 relative group cursor-pointer"
        aria-label="Launch SwaySpace Portal"
      >
        {/* Custom 2x2 Grid Logo for SwaySpace */}
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span className="absolute -inset-1 rounded-full bg-coral/10 animate-ping opacity-30 pointer-events-none group-hover:animate-none" />
      </Link>

      {/* Floating welcome bubble callout (showing to the left of the button) */}
      <AnimatePresence>
        {showCallout && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: [1, 1.03, 1],
              boxShadow: [
                '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                '0 10px 25px -5px rgba(255, 107, 53, 0.25), 0 8px 10px -6px rgba(255, 107, 53, 0.25)',
                '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
              ]
            }}
            transition={{
              scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              boxShadow: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              default: { duration: 0.3 }
            }}
            className="bg-white border border-near-black/5 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 relative after:content-[''] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[6px] after:border-transparent after:border-l-white before:content-[''] before:absolute before:left-full before:top-1/2 before:-translate-y-1/2 before:border-[7px] before:border-transparent before:border-l-near-black/5 cursor-pointer hover:border-coral/20 mr-1"
          >
            <Link href="/space/login" className="flex items-center gap-1.5 cursor-pointer decoration-transparent">
              <span className="text-[10px] font-bold uppercase tracking-wider text-near-black flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-coral"></span>
                </span>
                Access SwaySpace ⚡
              </span>
            </Link>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowCallout(false);
              }}
              className="text-neutral-400 hover:text-near-black p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
