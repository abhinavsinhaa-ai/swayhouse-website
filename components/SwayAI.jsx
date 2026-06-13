'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowLeft, ArrowRight, Instagram, Mail, Compass, HelpCircle, Loader2, Check } from 'lucide-react';

export default function SwayAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu'); // menu | info | audit_form | pitch_form | result | loading
  const [resultText, setResultText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [actionType, setActionType] = useState(''); // audit | pitch

  // Audit Form States
  const [auditForm, setAuditForm] = useState({
    handle: '',
    followers: '',
    niche: 'Lifestyle & Feel Good',
    frequency: '3-5 times',
    goal: ''
  });

  // Pitch Form States
  const [pitchForm, setPitchForm] = useState({
    handle: '',
    niche: 'Lifestyle & Feel Good',
    brand: '',
    reason: ''
  });

  // Handle outside click to close
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.ai-trigger-btn')) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Handle form submissions
  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!auditForm.handle || !auditForm.followers || !auditForm.goal) return;

    setCurrentScreen('loading');
    setActionType('audit');
    setErrorText('');
    setResultText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit', details: auditForm })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate audit');

      setResultText(data.result);
      setCurrentScreen('result');
    } catch (err) {
      setErrorText(err.message || 'Something went wrong. Please try again.');
      setCurrentScreen('audit_form');
    }
  };

  const handlePitchSubmit = async (e) => {
    e.preventDefault();
    if (!pitchForm.handle || !pitchForm.brand || !pitchForm.reason) return;

    setCurrentScreen('loading');
    setActionType('pitch');
    setErrorText('');
    setResultText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pitch', details: pitchForm })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate brand pitch');

      setResultText(data.result);
      setCurrentScreen('result');
    } catch (err) {
      setErrorText(err.message || 'Something went wrong. Please try again.');
      setCurrentScreen('pitch_form');
    }
  };

  const handleBookCall = () => {
    setIsOpen(false);
    // Smooth scroll to contact section
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
      // Pre-select Creator in contact form if possible
      const creatorBtn = document.querySelector('button[type="button"]');
      if (creatorBtn) creatorBtn.click();
    }
  };

  // Basic Markdown-like renderer for the AI output
  const renderFormattedResult = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      let content = line.trim();
      if (!content) return <div key={idx} className="h-3" />;

      // Headers (e.g. ### Header or ## Header)
      if (content.startsWith('###') || content.startsWith('##') || content.startsWith('#')) {
        const cleanHeader = content.replace(/^[#\s]+/, '');
        return (
          <h4 key={idx} className="font-cormorant text-xl font-bold text-near-black mt-5 mb-2 border-b border-near-black/5 pb-1">
            {cleanHeader}
          </h4>
        );
      }

      // Bullet Points
      if (content.startsWith('-') || content.startsWith('*') || content.startsWith('●')) {
        const cleanBullet = content.replace(/^[-*●\s]+/, '');
        return (
          <div key={idx} className="flex items-start gap-2.5 my-2.5 pl-1.5 text-xs md:text-sm text-neutral-600 leading-relaxed">
            <span className="text-coral flex-shrink-0 mt-1.5 text-[10px]">●</span>
            <span>{parseInlineBold(cleanBullet)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs md:text-sm text-neutral-500 leading-relaxed my-2">
          {parseInlineBold(content)}
        </p>
      );
    });
  };

  // Helper to parse **bold** text in lines
  const parseInlineBold = (str) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-near-black">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* ===== FLOATING TRIGGER BUTTON ===== */}
      <div className="fixed left-6 bottom-6 md:top-24 md:left-6 z-[999] select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="ai-trigger-btn flex items-center justify-center w-12 h-12 rounded-full bg-white border border-near-black/5 text-coral shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(255,107,53,0.2)] hover:scale-105 hover:border-coral/20 active:scale-95 transition-all duration-300 relative group"
          aria-label="Launch SwayAI"
        >
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
          
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-coral/10 animate-ping opacity-30 pointer-events-none group-hover:animate-none" />
          
          {/* Tooltip */}
          <span className="absolute left-14 hidden md:group-hover:inline-block px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-near-black bg-white border border-near-black/5 rounded-md shadow-md whitespace-nowrap">
            SwayAI Consultant
          </span>
        </button>
      </div>

      {/* ===== SIDEBAR PORTAL ===== */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[9998] backdrop-blur-[2px]"
            />

            {/* Slide-out Panel */}
            <motion.div
              ref={sidebarRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 h-screen w-full sm:w-[460px] bg-white border-r border-near-black/5 z-[9999] shadow-2xl flex flex-col justify-between"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-near-black/5 flex items-center justify-between bg-soft-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-coral/10 text-coral flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-cormorant text-lg font-bold text-near-black">SwayAI</h3>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 block -mt-1">Gemini Pro Enabled</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full border border-near-black/5 text-neutral-400 hover:text-near-black flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Scrollable Body */}
              <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                <AnimatePresence mode="wait">
                  {/* --- MENU SCREEN --- */}
                  {currentScreen === 'menu' && (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-6"
                    >
                      <div className="mb-2">
                        <h4 className="font-cormorant text-3xl font-light text-near-black mb-3">
                          Welcome to SwayAI.
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Your virtual creator economy consultant. Get instant strategic support, generate pitch copy, or learn how we scale talent.
                        </p>
                      </div>

                      {/* Options List */}
                      <div className="flex flex-col gap-4">
                        {/* Option 1: What We Offer */}
                        <button
                          onClick={() => setCurrentScreen('info')}
                          className="w-full text-left p-5 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black mb-1 group-hover:text-coral transition-colors">Who is SwayHouse & What we offer?</h5>
                            <p className="text-[11px] text-neutral-400 leading-normal">Explore our strategic business framework and advisory model.</p>
                          </div>
                        </button>

                        {/* Option 2: Growth Plan */}
                        <button
                          onClick={() => setCurrentScreen('audit_form')}
                          className="w-full text-left p-5 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black mb-1 group-hover:text-coral transition-colors">Personalized Growth Plan</h5>
                            <p className="text-[11px] text-neutral-400 leading-normal">Submit your stats to receive an instant, custom content audit.</p>
                          </div>
                        </button>

                        {/* Option 3: Draft Brand Pitch */}
                        <button
                          onClick={() => setCurrentScreen('pitch_form')}
                          className="w-full text-left p-5 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black mb-1 group-hover:text-coral transition-colors">Draft a Brand Pitch</h5>
                            <p className="text-[11px] text-neutral-400 leading-normal">Generate a tailored outreach email targeting premium brands.</p>
                          </div>
                        </button>

                        {/* Option 4: Book Call */}
                        <button
                          onClick={handleBookCall}
                          className="w-full text-left p-5 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs uppercase tracking-wider text-near-black mb-1 group-hover:text-coral transition-colors">Book a Free Consultation</h5>
                            <p className="text-[11px] text-neutral-400 leading-normal">First call is completely free. Money comes later—let&apos;s plan first.</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- SERVICES INFO SCREEN --- */}
                  {currentScreen === 'info' && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-5 text-left"
                    >
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-2"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      <h4 className="font-cormorant text-2xl font-bold text-near-black">
                        What We Do
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                        SwayHouse acts as a direct business partner to creators. We handle all operational and strategic execution so talent can focus entirely on creating.
                      </p>

                      <div className="flex flex-col gap-4">
                        {[
                          { title: "Growth Architecture", desc: "Niche audits, content matrix restructuring, platform distribution strategy." },
                          { title: "Brand Deals", desc: "Sourcing campaigns, outbound pitching, building long-term brand integrations." },
                          { title: "PR & Network Building", desc: "Creator-to-creator network building, event alignments, and campaign exposure." },
                          { title: "Strategic Operations", desc: "Contracts, calendar management, legal compliance, and billing pipelines." }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 bg-coral/5 border border-coral/10 rounded-xl">
                            <h5 className="font-bold text-xs text-near-black mb-1 flex items-center gap-2">
                              <Check className="w-4 h-4 text-coral" /> {item.title}
                            </h5>
                            <p className="text-[11px] text-neutral-400 leading-normal pl-6">{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleBookCall}
                        className="mt-6 w-full py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                      >
                        Book a Free Call
                      </button>
                    </motion.div>
                  )}

                  {/* --- AUDIT FORM SCREEN --- */}
                  {currentScreen === 'audit_form' && (
                    <motion.div
                      key="audit_form"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-5 text-left"
                    >
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-2"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      <h4 className="font-cormorant text-2xl font-bold text-near-black">
                        Growth Plan Audit
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                        Get a data-driven content matrix evaluation instantly powered by Gemini 1.5 Flash.
                      </p>

                      <form onSubmit={handleAuditSubmit} className="flex flex-col gap-4">
                        {/* IG Handle */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Instagram Handle</label>
                          <input
                            type="text"
                            placeholder="e.g. yourhandle"
                            required
                            value={auditForm.handle}
                            onChange={(e) => setAuditForm({ ...auditForm, handle: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {/* Followers */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Follower Count</label>
                          <input
                            type="text"
                            placeholder="e.g. 15,000"
                            required
                            value={auditForm.followers}
                            onChange={(e) => setAuditForm({ ...auditForm, followers: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {/* Niche */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Niche / Category</label>
                          <select
                            value={auditForm.niche}
                            onChange={(e) => setAuditForm({ ...auditForm, niche: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          >
                            <option>Lifestyle & Feel Good</option>
                            <option>Fashion & Styling</option>
                            <option>Fitness & Wellness</option>
                            <option>Travel & Photography</option>
                            <option>Beauty & Skincare</option>
                            <option>Other / Creative</option>
                          </select>
                        </div>

                        {/* Post Frequency */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Post Frequency (Weekly)</label>
                          <input
                            type="text"
                            placeholder="e.g. 3-4 reels"
                            required
                            value={auditForm.frequency}
                            onChange={(e) => setAuditForm({ ...auditForm, frequency: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {/* End Goal */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">What is your ultimate goal?</label>
                          <textarea
                            placeholder="e.g. Want to secure paid deals with sustainable fashion brands."
                            required
                            rows={3}
                            value={auditForm.goal}
                            onChange={(e) => setAuditForm({ ...auditForm, goal: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none resize-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {errorText && (
                          <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">{errorText}</p>
                        )}

                        <button
                          type="submit"
                          className="mt-2 w-full py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                        >
                          Generate Growth Plan
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* --- PITCH FORM SCREEN --- */}
                  {currentScreen === 'pitch_form' && (
                    <motion.div
                      key="pitch_form"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col gap-5 text-left"
                    >
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-2"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      <h4 className="font-cormorant text-2xl font-bold text-near-black">
                        Draft a Brand Pitch
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                        Draft a direct, confident outreach email template for pitching brands.
                      </p>

                      <form onSubmit={handlePitchSubmit} className="flex flex-col gap-4">
                        {/* IG Handle */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Instagram Handle</label>
                          <input
                            type="text"
                            placeholder="e.g. yourhandle"
                            required
                            value={pitchForm.handle}
                            onChange={(e) => setPitchForm({ ...pitchForm, handle: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {/* Niche */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Niche / Category</label>
                          <select
                            value={pitchForm.niche}
                            onChange={(e) => setPitchForm({ ...pitchForm, niche: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          >
                            <option>Lifestyle & Feel Good</option>
                            <option>Fashion & Styling</option>
                            <option>Fitness & Wellness</option>
                            <option>Travel & Photography</option>
                            <option>Beauty & Skincare</option>
                            <option>Other / Creative</option>
                          </select>
                        </div>

                        {/* Target Brand */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Target Brand</label>
                          <input
                            type="text"
                            placeholder="e.g. Zara or Gymshark"
                            required
                            value={pitchForm.brand}
                            onChange={(e) => setPitchForm({ ...pitchForm, brand: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {/* Reason / Alignment */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Why fits this brand?</label>
                          <textarea
                            placeholder="e.g. I wear their outfits in all my lookbooks, and my audience regularly asks about product links."
                            required
                            rows={3}
                            value={pitchForm.reason}
                            onChange={(e) => setPitchForm({ ...pitchForm, reason: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none resize-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        {errorText && (
                          <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">{errorText}</p>
                        )}

                        <button
                          type="submit"
                          className="mt-2 w-full py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                        >
                          Draft Brand Pitch
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* --- LOADING SCREEN --- */}
                  {currentScreen === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center py-20"
                    >
                      <Loader2 className="w-10 h-10 text-coral animate-spin mb-4" />
                      <h4 className="font-cormorant text-2xl font-bold text-near-black mb-2">Analyzing Data</h4>
                      <p className="text-xs text-neutral-400 max-w-xs leading-normal">
                        Gemini 1.5 Flash is generating your customized strategy. This will take just a few seconds...
                      </p>
                    </motion.div>
                  )}

                  {/* --- RESULT SCREEN --- */}
                  {currentScreen === 'result' && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col text-left"
                    >
                      <button
                        onClick={() => setCurrentScreen(actionType === 'audit' ? 'audit_form' : 'pitch_form')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-4"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to details
                      </button>

                      <div className="bg-coral/5 border border-coral/10 rounded-xl p-5 mb-6 shadow-sm overflow-x-hidden">
                        {renderFormattedResult(resultText)}
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleBookCall}
                          className="w-full py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all text-center shadow-md"
                        >
                          Claim Your Free Consultation Call
                        </button>
                        <button
                          onClick={() => setCurrentScreen('menu')}
                          className="w-full py-3.5 rounded-full bg-white border border-near-black/5 text-neutral-500 text-xs font-bold uppercase tracking-wider hover:text-near-black hover:bg-neutral-50 transition-all text-center"
                        >
                          Return to Main Menu
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-near-black/5 bg-soft-white text-center select-none flex flex-col gap-2">
                <span className="font-cormorant italic text-xs text-neutral-400">You Create. We Elevate.</span>
                <div className="flex gap-4 justify-center">
                  <a href="https://instagram.com/swayhousehq" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors flex items-center gap-1">
                    <Instagram className="w-3 h-3" /> Instagram
                  </a>
                  <span className="text-neutral-300">•</span>
                  <a href="mailto:hello@swayhouse.in" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
