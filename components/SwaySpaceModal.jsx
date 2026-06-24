'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Layout, Link as LinkIcon, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SwaySpaceModal({ isOpen, onClose }) {
  // Disable main body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 md:p-6"
          onClick={onClose}
        >
          {/* Main Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-[800px] max-h-[85vh] bg-[#FBF9F6] border border-near-black/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="sticky top-0 z-10 w-full h-20 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-near-black/5 flex items-center justify-between px-6 md:px-10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-bold text-near-black">SwaySpace</h3>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 block -mt-0.5">Your Premium Bio-Grid Ecosystem</span>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-near-black/10 hover:border-near-black/30 hover:bg-near-black hover:text-white flex items-center justify-center transition-all duration-300"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 no-scrollbar flex flex-col gap-8">
              {/* Hero Banner Card */}
              <div className="bg-gradient-to-br from-near-black to-[#2A2A2A] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-white/5">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-coral/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-4 max-w-lg">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-coral bg-coral/10 border border-coral/20 px-3 py-1 rounded-full self-start">
                    Now Live
                  </span>
                  <h4 className="font-cormorant text-4xl md:text-5xl font-light leading-tight">
                    Own your beautiful visual digital home.
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    SwaySpace is a dynamic bio-grid engine tailored for creators, brands, and designers. Display your visual archives, organize key links, highlight your vibes, and accept secure chats.
                  </p>
                </div>
              </div>

              {/* Core Features Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-coral">Why choose SwaySpace?</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-3">
                    <div className="w-9 h-9 rounded-xl bg-coral/5 text-coral flex items-center justify-center">
                      <Layout className="w-4.5 h-4.5" />
                    </div>
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black">Visual Grid Layout</h5>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      A premium, masonry-inspired gallery layout that showcases your images, portfolio, and captions with a state-of-the-art visual aesthetic.
                    </p>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-3">
                    <div className="w-9 h-9 rounded-xl bg-coral/5 text-coral flex items-center justify-center">
                      <LinkIcon className="w-4.5 h-4.5" />
                    </div>
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black">Custom Branding</h5>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      Tailor your designation, add verified contact information, and attach key links to direct your audience to your products, reels, or socials.
                    </p>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-3">
                    <div className="w-9 h-9 rounded-xl bg-coral/5 text-coral flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5" />
                    </div>
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black">E2E Secure Data</h5>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      Built with rigorous cryptographic standards. All communications, visual assets, and grids are secured using industry-leading end-to-end encryption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-step onboarding overview */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-coral">Ready in 3 Simple Steps</span>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
                  {[
                    { num: "01", title: "Claim Username", desc: "Choose your unique space address (e.g. yourname)" },
                    { num: "02", title: "Set Your Grid", desc: "Upload your photos, captions, and links" },
                    { num: "03", title: "Share & Connect", desc: "Publish your grid link to your Instagram bio" }
                  ].map((step, idx) => (
                    <div key={idx} className="flex-1 bg-coral/5 border border-coral/10 rounded-2xl p-5 flex items-start gap-4 animate-fade-in">
                      <span className="font-cormorant text-3xl font-extrabold text-coral/40 leading-none">{step.num}</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-near-black">{step.title}</span>
                        <p className="text-[10px] text-neutral-400 leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <footer className="p-6 border-t border-near-black/5 bg-[#FBF9F6] flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-green-700" /> Free & Secure Registration
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-near-black/10 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/space/login"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Create Your Space <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
