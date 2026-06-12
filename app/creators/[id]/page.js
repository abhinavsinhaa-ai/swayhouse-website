'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Instagram, X, ArrowUpRight, Sparkles, Heart } from 'lucide-react';
import { ROSTER } from '@/utils/roster';

export default function CreatorDashboard({ params }) {
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxCaption, setLightboxCaption] = useState('');

  useEffect(() => {
    // Find creator matching params.id
    const found = ROSTER.find((c) => c.id === params.id);
    if (found) {
      setCreator(found);
    } else {
      router.push('/');
    }
  }, [params.id, router]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pre-mapped captions for Aditi's gallery
  const galleryCaptions = [
    "Appreciating the quiet, simple moments in everyday life.",
    "Finding joy and connection in authentic self-expression.",
    "Surrounding myself with nature's beauty and colors.",
    "A gentle reminder to find warmth in small companions.",
    "Lost in a corner of blooms and visual inspirations.",
    "Elegant shapes and sleek contrasts.",
    "Vibrant shades and bold choices.",
    "Confidence in every detail."
  ];

  const handleOpenLightbox = (src, caption) => {
    setLightboxImage(src);
    setLightboxCaption(caption || '');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-near-black font-inter selection:bg-coral selection:text-white relative overflow-x-hidden antialiased">
      {/* Noise background overlay */}
      <div className="noise-bg opacity-[0.02] pointer-events-none fixed inset-0 z-50"></div>

      {/* ===== EDITORIAL HEADER ===== */}
      <header className="w-full h-20 border-b border-near-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-40 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Back to SwayHouse Website */}
          <Link 
            href="/#creators" 
            className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>SwayHouse Roster</span>
          </Link>

          {/* SwayHouse Minimal Logo Backlink */}
          <Link href="/" className="flex items-center gap-2 logo-element group">
            <svg className="w-6 h-5.5 text-coral" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 32 V19 L20 11 L28 19 V32 H12 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              <path d="M3 24 C 13 13, 27 33, 37 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            <span className="font-inter text-xs font-extrabold tracking-tight text-near-black">SwayHouse</span>
          </Link>
        </div>
      </header>

      {/* ===== CREATOR PROFILE AREA ===== */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 pt-10 pb-24">
        
        {/* Profile Card & Info */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20">
          {/* Left Column: Profile Cover Photo */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-near-black/5 bg-neutral-100 aspect-[4/5] shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={creator.images[0]} 
              alt={creator.name} 
              className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-[1.02]" 
            />
          </div>

          {/* Right Column: Bio Details */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="self-start text-[10px] font-bold uppercase tracking-wider text-coral bg-coral/10 px-3 py-1 rounded mb-4 select-none">
              Managed by SwayHouse
            </span>

            <h1 className="font-cormorant text-5xl md:text-7xl font-light text-near-black tracking-tight leading-tight mb-2">
              {creator.name}
            </h1>

            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-neutral-400 mb-8 flex flex-wrap items-center gap-3">
              <span>{creator.niche}</span>
              <span className="text-neutral-300">•</span>
              <span>Based in {creator.location}</span>
            </p>

            {/* Social handles and stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-near-black/5">
              <a 
                href={`https://instagram.com/${creator.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="relative overflow-hidden px-8 py-3.5 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 group clickable shadow-md hover:shadow-lg transition-all"
              >
                <div className="absolute inset-0 bg-coral-hover scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Follow @{creator.instagram}
                </span>
              </a>

              <div className="text-xs text-neutral-400 max-w-xs leading-normal">
                For commercial opportunities, campaigns, and partnerships, reach out directly.
              </div>
            </div>

            {/* Micro Details Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Age</span>
                <span className="text-base font-bold text-near-black">{creator.age}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Niche</span>
                <span className="text-base font-bold text-near-black">Lifestyle</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Status</span>
                <span className="text-base font-bold text-near-black inline-flex items-center gap-1">
                  Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== "FROM CREATOR" LETTER SECTION ===== */}
        <section className="py-16 border-t border-b border-near-black/5 bg-[#FFF] rounded-2xl p-8 md:p-14 shadow-sm max-w-[950px] mx-auto mb-20 relative">
          <span className="absolute -top-7 -left-3 font-cormorant text-8xl text-coral/15 select-none leading-none pointer-events-none">“</span>
          
          <div className="max-w-[760px] mx-auto">
            <span className="text-[9px] font-bold uppercase tracking-widest text-coral mb-4 block select-none">● A Message From {creator.name}</span>
            
            <p className="font-cormorant italic text-lg md:text-2xl text-neutral-600 leading-relaxed mb-8 whitespace-pre-line">
              {creator.message}
            </p>

            {/* Aesthetic quote sign-off */}
            <div className="pt-6 border-t border-near-black/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral/5 text-coral flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-coral/10" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Signed</span>
                  <span className="text-xs font-semibold text-near-black">Aditi 🤍</span>
                </div>
              </div>
              
              <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                SwayHouse Creator Portfolio
              </div>
            </div>
          </div>
        </section>

        {/* ===== CREATOR MASONRY VSCO GRID GALLERY ===== */}
        <section className="mb-10">
          <div className="text-center mb-16 select-none">
            <span className="text-[9px] font-bold uppercase tracking-widest text-coral mb-3 block">● Visual Grid</span>
            <h2 className="font-cormorant text-4xl md:text-5xl font-light text-near-black">
              Gallery & Aesthetic Journal
            </h2>
            <p className="text-xs text-neutral-400 mt-2">
              A curated space reflecting moments, style, and everyday beauty. Click on photos to expand.
            </p>
          </div>

          {/* Masonry Columns */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {creator.images.slice(1).map((src, index) => {
              const caption = galleryCaptions[index] || "SwayHouse Gallery Spec.";
              return (
                <div 
                  key={index} 
                  onClick={() => handleOpenLightbox(src, caption)}
                  className="break-inside-avoid mb-6 relative group overflow-hidden rounded-xl border border-near-black/5 bg-neutral-100 shadow-md cursor-pointer clickable"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={src} 
                    alt={`${creator.name} Gallery Photo ${index + 1}`} 
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" 
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur px-3 py-1.5 rounded-full select-none">
                      Zoom View
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===== EDITORIAL FOOTER ===== */}
      <footer className="py-12 border-t border-near-black/5 bg-white text-center">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2 logo-element group">
            <svg className="w-5 h-4.5 text-coral" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 32 V19 L20 11 L28 19 V32 H12 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
              <path d="M3 24 C 13 13, 27 33, 37 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none" />
            </svg>
            <span className="font-inter text-xs font-extrabold tracking-tight text-near-black">SwayHouse</span>
          </Link>

          <p className="text-[10px] font-semibold text-neutral-400 tracking-wider">
            &copy; {new Date().getFullYear()} SWAYHOUSE. ALL RIGHTS RESERVED.
          </p>

          <Link href="/#contact" className="text-xs font-bold uppercase tracking-wider text-coral hover:text-coral-hover transition-colors">
            Collaborate With Us
          </Link>
        </div>
      </footer>

      {/* ===== REACT LIGHTBOX OVERLAY ===== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close Lightbox */}
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lightbox Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-[90vw] max-h-[75vh] overflow-hidden rounded-xl relative shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={lightboxImage} 
                alt="Lightbox Zoom" 
                className="w-auto h-auto max-w-full max-h-[75vh] object-contain" 
              />
            </motion.div>

            {/* Lightbox Caption */}
            {lightboxCaption && (
              <p className="text-white/80 font-cormorant italic text-lg md:text-xl text-center mt-6 max-w-md px-4 leading-normal">
                {lightboxCaption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
