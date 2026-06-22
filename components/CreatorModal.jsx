'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, MapPin, Calendar, Heart, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function CreatorModal({ creator, onClose }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxCaption, setLightboxCaption] = useState('');

  // Disable main body scroll when creator space is open
  useEffect(() => {
    if (creator) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [creator]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, onClose]);

  if (!creator) return null;

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
    <>
      <AnimatePresence>
        {creator && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 120 }}
            className="fixed inset-0 w-full h-full bg-[#FBF9F6] z-[2000] overflow-y-auto select-text flex flex-col"
            data-lenis-prevent="true"
          >
            {/* Fullscreen Sticky Nav Header */}
            <header className="sticky top-0 z-50 w-full h-20 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-near-black/5 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-inter text-sm font-extrabold tracking-tight text-near-black">
                  SwayHouse
                </span>
                <span className="text-neutral-300 text-xs">|</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Creator Space
                </span>
              </div>
              
              <button 
                onClick={onClose}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-near-black/10 hover:border-near-black/30 hover:bg-near-black hover:text-white transition-all duration-300"
                aria-label="Close space"
              >
                <span className="text-xs font-bold uppercase tracking-widest select-none">
                  Close Space
                </span>
                <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </header>

            {/* Immersive Space Content Container */}
            <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
              
              {/* Creator Intro Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                
                {/* Large Profile Picture */}
                <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-near-black/5 bg-neutral-100 aspect-[4/5] shadow-lg">
                  <Image 
                    src={creator.images[0]} 
                    alt={creator.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                    className="object-cover transition-transform duration-750 ease-out group-hover:scale-[1.03]" 
                  />
                </div>

                {/* Info & Details */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <span className="self-start text-[10px] font-bold uppercase tracking-wider text-coral bg-coral/10 px-3 py-1 rounded-full mb-6 select-none">
                    Managed by SwayHouse
                  </span>

                  <h2 className="font-cormorant text-6xl md:text-8xl font-light text-near-black tracking-tight leading-none mb-6">
                    {creator.name}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-8">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-coral" />
                      Based in {creator.location}
                    </span>
                    <span className="text-neutral-300 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-coral" />
                      Age {creator.age}
                    </span>
                    <span className="text-neutral-300 hidden sm:inline">•</span>
                    <span>{creator.niche}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-near-black/5">
                    <a 
                      href={`https://instagram.com/${creator.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="relative overflow-hidden px-8 py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 group clickable shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-coral-hover scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Follow @{creator.instagram}
                      </span>
                    </a>

                    <div className="text-xs text-neutral-400 max-w-xs leading-normal">
                      For collaboration, commercial opportunities, and brand partnerships, connect with her verified space.
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Niche</span>
                      <span className="text-sm font-bold text-near-black">{creator.niche.split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Vibe</span>
                      <span className="text-sm font-bold text-near-black">Aesthetic</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Status</span>
                      <span className="text-sm font-bold text-near-black">Exclusive</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Letter/Bio Section */}
              <div className="relative py-12 md:py-20 border-t border-b border-near-black/5 bg-white rounded-2xl px-6 md:px-12 shadow-sm max-w-[900px] mx-auto w-full">
                <span className="absolute -top-8 -left-3 font-cormorant text-9xl text-coral/15 select-none leading-none pointer-events-none">“</span>
                
                <div className="max-w-[750px] mx-auto">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-coral mb-4 block select-none">
                    ● A Personal Message From {creator.name}
                  </span>
                  
                  <p className="font-cormorant italic text-xl md:text-2xl text-neutral-600 leading-relaxed mb-8 whitespace-pre-line">
                    {creator.message}
                  </p>

                  <div className="pt-6 border-t border-near-black/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-coral/5 text-coral flex items-center justify-center">
                        <Heart className="w-5 h-5 fill-coral/10" />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block">Signed</span>
                        <span className="text-sm font-bold text-near-black">{creator.name} 🤍</span>
                      </div>
                    </div>
                    
                    <div className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 select-none">
                      SwayHouse Exclusive Talent
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div>
                <div className="text-center mb-12 select-none">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-coral mb-2 block">● Visual Grid</span>
                  <h3 className="font-cormorant text-4xl font-light text-near-black mb-2">
                    Aesthetic Journal & Moments
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    A curated visual archive reflecting moments, style, and everyday lifestyle inspiration. Click to view.
                  </p>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                  {creator.images.slice(1).map((src, index) => {
                    const originalIndex = index + 1;
                    const caption = (creator.captions && creator.captions[originalIndex]) || galleryCaptions[index % galleryCaptions.length];
                    return (
                      <div 
                        key={index}
                        onClick={() => handleOpenLightbox(src, caption)}
                        className="break-inside-avoid mb-6 relative group overflow-hidden rounded-xl border border-near-black/5 bg-neutral-100 shadow-md cursor-pointer clickable"
                      >
                        <Image 
                          src={src} 
                          alt={`${creator.name} Gallery Photo ${index + 1}`}
                          width={400}
                          height={500}
                          className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" 
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/45 backdrop-blur px-4 py-2 rounded-full select-none">
                            Zoom View
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white transition-all duration-300"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="max-w-[90vw] max-h-[75vh] overflow-hidden rounded-xl relative shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt="Lightbox Zoom" 
                className="w-auto h-auto max-w-full max-h-[75vh] object-contain" 
              />
            </motion.div>

            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              exit={{ y: 10, opacity: 0 }}
              className="text-white font-cormorant italic text-lg md:text-xl text-center mt-6 max-w-md px-4 leading-normal select-none"
            >
              {lightboxCaption}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
