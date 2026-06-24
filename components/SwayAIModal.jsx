'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Compass, Mail, Shield, MessageSquare, ArrowRight } from 'lucide-react';

export default function SwayAIModal({ isOpen, onClose }) {
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

  const handleLaunchDrawer = () => {
    onClose();
    // Dispatch the custom event to open the sidebar chat drawer
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-swayai'));
    }, 150);
  };

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
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-bold text-near-black">SwayAI Platform</h3>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 block -mt-0.5">Google Gemini Powered AI Consultant</span>
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
              <div className="bg-gradient-to-br from-[#1E1E24] to-[#121214] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-white/5">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-coral/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-4 max-w-lg">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-coral bg-coral/10 border border-coral/20 px-3 py-1 rounded-full self-start">
                    Active Operations
                  </span>
                  <h4 className="font-cormorant text-4xl md:text-5xl font-light leading-tight">
                    Next-Gen AI Advisor for the Creator Economy.
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    SwayAI analyzes niche details, audits audience parameters, drafts outbound pitches to target brands, and reviews collaboration agreements—all powered by Google Gemini.
                  </p>
                </div>
              </div>

              {/* Core Offerings Section */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-coral">Core Capabilities</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item 1 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-coral/5 text-coral flex items-center justify-center flex-shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-near-black mb-1">Growth Audits</h5>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Evaluates your niche, follower count, and posting frequency to map a personalized content grid strategy, audience growth blueprint, and value-metric benchmarks.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-coral/5 text-coral flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-near-black mb-1">Outbound Brand Pitching</h5>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Drafts bespoke pitch emails customized for specific luxury and premium brands. Focuses on authentic integration proposals and engagement statistics.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-coral/5 text-coral flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-near-black mb-1">Operational & Legal Advice</h5>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Reviews standard terms in collaboration agreements to protect usage rights, define payment timeline terms, and identify operational red flags.
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-coral/5 text-coral flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-near-black mb-1">Encrypted Live Chat Session</h5>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Interact in real-time about campaign budgets, rates negotiation advice, content scheduling layouts, or brand alignments with secure, E2E chat protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <footer className="p-6 border-t border-near-black/5 bg-[#FBF9F6] flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-coral bg-coral/5 border border-coral/10 rounded-full px-3 py-1 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-coral animate-pulse" /> Gemini 2.5 Flash Engine Integration
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-near-black/10 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleLaunchDrawer}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Launch Assistant Drawer <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
