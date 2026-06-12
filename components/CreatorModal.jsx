'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Instagram, Star, Camera, Shirt } from 'lucide-react';

export default function CreatorModal({ creator, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Close on Escape key press and disable scroll
  useEffect(() => {
    if (!creator) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [creator, onClose]);

  if (!creator) return null;

  const hasImages = creator.images && creator.images.length > 0;
  const mockGradients = [
    'linear-gradient(135deg, #FF6B35 0%, #FF9A5C 100%)',
    'linear-gradient(135deg, #FF9A5C 0%, #FFD166 100%)',
    'linear-gradient(135deg, #FF6B35 0%, #D95A3B 100%)'
  ];
  
  const mockIcons = [
    <Camera className="w-16 h-16 opacity-80" key="cam" />,
    <Star className="w-16 h-16 opacity-80" key="star" />,
    <Shirt className="w-16 h-16 opacity-80" key="shirt" />
  ];

  const totalSlides = hasImages ? creator.images.length : 3;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Backdrop blur overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Panel Container */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[900px] bg-white rounded-2xl shadow-2xl border border-near-black/5 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] min-h-[500px]"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/80 backdrop-blur border border-near-black/5 rounded-full text-near-black hover:scale-105 hover:bg-near-black hover:text-white transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Carousel */}
          <div className="relative bg-neutral-100 overflow-hidden h-[320px] md:h-auto min-h-[320px]">
            <div 
              className="flex w-full h-full transition-transform duration-550 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {hasImages ? (
                creator.images.map((src, index) => (
                  <div key={index} className="flex-shrink-0 w-full h-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${creator.name} — Slide ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                mockGradients.map((bg, index) => (
                  <div key={index} className="flex-shrink-0 w-full h-full flex items-center justify-center text-white" style={{ background: bg }}>
                    {mockIcons[index]}
                  </div>
                ))
              )}
            </div>

            {/* Navigation arrows */}
            {totalSlides > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur border border-near-black/5 text-near-black flex items-center justify-center hover:bg-white hover:text-coral disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
                <button 
                  onClick={handleNext}
                  disabled={currentSlide === totalSlides - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur border border-near-black/5 text-near-black flex items-center justify-center hover:bg-white hover:text-coral disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              </>
            )}

            {/* Indicator dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur px-3 py-1.5 rounded-full">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Creator Info Panel */}
          <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
            <span className="self-start text-[10px] font-bold uppercase tracking-wider text-coral bg-coral/10 px-2.5 py-1 rounded mb-4">
              Managed by SwayHouse
            </span>
            <h3 className="font-cormorant text-4xl font-semibold text-near-black mb-6">
              {creator.name}
            </h3>

            <div className="flex flex-wrap gap-8 mb-8 pb-6 border-b border-near-black/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Age</span>
                <span className="text-sm font-semibold text-near-black">{creator.age || '--'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Location</span>
                <span className="text-sm font-semibold text-near-black">{creator.location || '--'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Niche</span>
                <span className="text-sm font-semibold text-near-black">{creator.niche || '--'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Platform</span>
                <a 
                  href={`https://instagram.com/${creator.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-coral hover:text-coral-hover text-sm font-semibold transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@{creator.instagram}</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -top-7 -left-3 font-cormorant text-7xl text-coral/15 select-none">“</span>
              <p className="font-cormorant italic text-lg text-neutral-500 leading-relaxed relative z-10 whitespace-pre-line">
                {creator.message}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
