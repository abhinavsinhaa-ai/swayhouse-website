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
            className="w-full max-w-[900px] h-[85vh] bg-[#FBF9F6] border border-near-black/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="sticky top-0 z-10 w-full h-20 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-near-black/5 flex items-center justify-between px-6 md:px-10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-bold text-near-black">Exclusive Creators Roster</h3>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 block -mt-0.5">SwayHouse Elite Talent Portfolio</span>
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

            {/* Filter and Search Bar */}
            <div className="px-6 md:px-10 py-4 bg-[#FBF9F6] border-b border-near-black/5 flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search creator or handle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-near-black/5 rounded-full pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Niche Pills */}
              <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar pb-1 md:pb-0 select-none">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedNiche === niche
                        ? 'bg-near-black text-white border-near-black'
                        : 'bg-white text-neutral-500 border-near-black/5 hover:text-near-black'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            {/* Content list (Line-by-line / structured layout) */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 no-scrollbar flex flex-col gap-4">
              {filteredRoster.length > 0 ? (
                filteredRoster.map((creator, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    key={creator.id}
                    className="bg-white border border-near-black/5 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md hover:border-coral/15 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                    {/* Left: Avatar & Info */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto text-center sm:text-left">
                      {/* Avatar */}
                      <div className="w-16 h-16 md:w-20 md:h-20 relative rounded-2xl overflow-hidden border border-near-black/5 bg-neutral-100 flex-shrink-0">
                        <Image
                          src={creator.images[0]}
                          alt={creator.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      {/* Info details */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center flex-wrap gap-2 justify-center sm:justify-start">
                          <h4 className="font-cormorant text-xl md:text-2xl font-bold text-near-black">{creator.name}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-coral bg-coral/5 px-2.5 py-0.5 rounded-full">
                            {creator.niche}
                          </span>
                        </div>

                        {/* Location / Meta */}
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-neutral-400 justify-center sm:justify-start uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-coral" /> Based in {creator.location}
                          </span>
                          <span>•</span>
                          <span>Age {creator.age}</span>
                        </div>

                        {/* Bio snippet */}
                        <p className="text-[11px] text-neutral-500 max-w-md leading-normal line-clamp-1 italic mt-1 font-cormorant">
                          "{creator.message?.substring(0, 100)}..."
                        </p>
                      </div>
                    </div>

                    {/* Right: Instagram & View Button */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-near-black/5">
                      <a
                        href={`https://instagram.com/${creator.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-coral transition-colors font-semibold"
                      >
                        <Instagram className="w-4 h-4" />
                        <span className="hidden md:inline">@{creator.instagram}</span>
                      </a>
                      <button
                        onClick={() => handleSelect(creator)}
                        className="px-5 py-2.5 rounded-full bg-near-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-coral transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        Open Space <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="font-cormorant text-xl text-near-black font-bold">No creators match filter</span>
                  <p className="text-xs text-neutral-400 mt-1">Try resetting search parameters.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="p-6 border-t border-near-black/5 bg-[#FBF9F6] text-center select-none flex-shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Total Exclusive Roster Size: {roster.length} Creators</span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
