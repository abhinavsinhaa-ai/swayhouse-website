'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, MapPin, Sparkles, ArrowRight, Search, Users } from 'lucide-react';
import Image from 'next/image';

export default function CreatorsModalRoster({ isOpen, onClose, roster, onSelectCreator }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');

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

  // Filter Niches
  const niches = ['All', ...Array.from(new Set(roster.map(c => c.niche)))];

  // Filter roster
  const filteredRoster = roster.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          creator.instagram.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = selectedNiche === 'All' || creator.niche === selectedNiche;
    return matchesSearch && matchesNiche;
  });

  const handleSelect = (creator) => {
    onClose();
    // Brief timeout so that the detail modal animations can trigger cleanly
    setTimeout(() => {
      onSelectCreator(creator);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 120 }}
          className="fixed inset-0 w-full h-full bg-[#FBF9F6] z-[2000] overflow-y-auto select-text flex flex-col"
          data-lenis-prevent="true"
        >
          {/* Top Bar Header */}
          <header className="sticky top-0 z-50 w-full h-20 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-near-black/5 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-inter text-sm font-extrabold tracking-tight text-near-black">
                SwayHouse
              </span>
              <span className="text-neutral-300 text-xs">|</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Creators Roster
              </span>
            </div>
            
            <button 
              onClick={onClose}
              className="group flex items-center gap-2 px-4 py-2 rounded-full border border-near-black/10 hover:border-near-black/30 hover:bg-near-black hover:text-white transition-all duration-300 cursor-pointer"
              aria-label="Close portal"
            >
              <span className="text-xs font-bold uppercase tracking-widest select-none">
                Close Portal
              </span>
              <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </header>

          {/* Search, filters, and title */}
          <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pt-8 flex flex-col gap-6 flex-shrink-0 select-none">
            <div className="text-center md:text-left">
              <span className="text-[9px] font-bold uppercase tracking-widest text-coral">Exclusive Representation</span>
              <h2 className="font-cormorant text-4xl md:text-5xl font-light text-near-black mt-1">Our Managed Creators</h2>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-near-black/5 p-4 rounded-2xl shadow-sm">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search creator or instagram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-semibold"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Niche Pills */}
              <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar pb-1 md:pb-0">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedNiche === niche
                        ? 'bg-near-black text-white border-near-black'
                        : 'bg-[#FBF9F6] text-neutral-500 border-near-black/5 hover:text-near-black'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Immersive Symmetric Roster Grid */}
          <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10 md:py-16">
            {filteredRoster.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRoster.map((creator, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
                    key={creator.id}
                    className="bg-white border border-near-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col group"
                  >
                    {/* Large Image container */}
                    <div 
                      onClick={() => handleSelect(creator)}
                      className="aspect-[4/5] relative bg-neutral-100 overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={creator.images[0]}
                        alt={creator.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover transition-transform duration-750 ease-out group-hover:scale-[1.03]"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur px-4 py-2 rounded-full select-none">
                          View Bio-Grid
                        </span>
                      </div>
                      
                      {/* Niche tag overlay */}
                      <span className="absolute top-4 left-4 text-[8px] font-bold uppercase tracking-wider text-coral bg-[#FBF9F6] border border-near-black/5 px-2.5 py-1 rounded-full">
                        {creator.niche}
                      </span>
                    </div>

                    {/* Meta info & direct click actions */}
                    <div className="p-6 flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h4 
                            onClick={() => handleSelect(creator)}
                            className="font-cormorant text-2xl font-bold text-near-black hover:text-coral transition-colors cursor-pointer"
                          >
                            {creator.name}
                          </h4>
                          <a
                            href={`https://instagram.com/${creator.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-coral transition-colors p-0.5"
                            aria-label={`Instagram profile for ${creator.name}`}
                          >
                            <Instagram className="w-4.5 h-4.5" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-coral" /> {creator.location}
                          </span>
                          <span>•</span>
                          <span>Age {creator.age}</span>
                        </div>
                      </div>

                      {/* Bio preview snippet */}
                      <p className="text-[11px] text-neutral-500 font-cormorant italic leading-relaxed line-clamp-2 border-t border-near-black/5 pt-3">
                        "{creator.message?.substring(0, 110) || creator.bio?.substring(0, 110)}..."
                      </p>

                      <button
                        onClick={() => handleSelect(creator)}
                        className="w-full mt-2 py-3 rounded-xl bg-near-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-coral hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        Open Creator Space <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-cormorant text-xl text-near-black font-bold">No creators match criteria</span>
                <p className="text-xs text-neutral-400 mt-1">Try adjusting search parameters.</p>
              </div>
            )}
          </div>

          {/* Footer Roster stats */}
          <footer className="p-8 border-t border-near-black/5 bg-[#FBF9F6] text-center select-none flex-shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Total Represented: {roster.length} Exclusive Creators</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
