'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Instagram, X, ArrowUpRight, Sparkles, Heart, Play, Volume2, VolumeX } from 'lucide-react';
import { ROSTER } from '@/utils/roster';
import { supabase } from '@/utils/supabase';
import { useRef } from 'react';

function LazyVideoPlayer({ videoSrc, posterSrc, alt, onClick }) {
  const videoRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '120px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      try {
        if (isIntersecting) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } else {
          videoRef.current.pause();
        }
      } catch (err) {
        console.warn('HTML5 Video play/pause failed or blocked:', err);
      }
    }
  }, [isIntersecting]);

  return (
    <div className="relative w-full h-full" onClick={onClick}>
      <video
        ref={videoRef}
        src={isIntersecting ? videoSrc : undefined}
        poster={posterSrc}
        muted
        loop
        playsInline
        className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] block"
      />
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white rounded-lg flex items-center gap-1 border border-white/10 shadow-sm select-none pointer-events-none z-10">
        <Play className="w-2.5 h-2.5 fill-current text-white" />
        <span className="text-[7.5px] font-bold uppercase tracking-wider">Video</span>
      </div>
    </div>
  );
}

export default function CreatorDashboard({ params }) {
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxCaption, setLightboxCaption] = useState('');
  const [lightboxDate, setLightboxDate] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [isMuted, setIsMuted] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);

  useEffect(() => {
    async function loadCreator() {
      if (!params || !params.id) return;
      const cleanParamId = (params.id || '').trim();
      try {
        const staticCreator = ROSTER.find((c) => c.id && c.id.toLowerCase().trim() === cleanParamId.toLowerCase());
        let query = supabase.from('creator_profiles').select('id, name, age, location, instagram, niche, bio, message, images');
        if (staticCreator) {
          const parts = [`id.ilike.${cleanParamId}`];
          if (staticCreator.instagram) {
            parts.push(`instagram.ilike.${staticCreator.instagram.replace('@', '')}`);
          }
          query = query.or(parts.join(','));
        } else {
          query = query.ilike('id', cleanParamId);
        }

        const { data: dbCreators, error } = await query;

        if (dbCreators && dbCreators.length > 0 && !error) {
          const creatorData = dbCreators[0];
          const cleanImages = [];
          const parsedCaptions = [];
          const parsedDates = [];
          const parsedMusicTracks = [];
          const parsedMusicArtists = [];
          const parsedMusicPreviews = [];
          const parsedMusicOffsets = [];
          const parsedLocations = [];
          if (creatorData.images) {
            creatorData.images.forEach((img, idx) => {
              if (img && img.includes('||')) {
                const parts = img.split('||');
                cleanImages.push(parts[0]);
                parsedCaptions.push(parts[1] || '');
                parsedDates.push(parts[2] || '');
                parsedMusicTracks.push(parts[3] || '');
                parsedMusicArtists.push(parts[4] || '');
                parsedMusicPreviews.push(parts[5] || '');
                parsedMusicOffsets.push(parts[6] || '0');
                parsedLocations.push(parts[7] || '');
              } else {
                cleanImages.push(img);
                parsedCaptions.push((creatorData.captions && creatorData.captions[idx]) || '');
                parsedDates.push('');
                parsedMusicTracks.push('');
                parsedMusicArtists.push('');
                parsedMusicPreviews.push('');
                parsedMusicOffsets.push('0');
                parsedLocations.push('');
              }
            });
          }
          creatorData.images = cleanImages;
          creatorData.captions = parsedCaptions;
          creatorData.dates = parsedDates;
          creatorData.musicTracks = parsedMusicTracks;
          creatorData.musicArtists = parsedMusicArtists;
          creatorData.musicPreviews = parsedMusicPreviews;
          creatorData.musicOffsets = parsedMusicOffsets;
          creatorData.locations = parsedLocations;
          setCreator(creatorData);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch creator from database, falling back to static roster:', err);
      }

      // Fallback to static ROSTER if DB is not configured or fails
      const found = ROSTER.find((c) => c.id && c.id.toLowerCase().trim() === (params?.id || '').toLowerCase().trim());
      if (found) {
        setCreator(found);
      } else {
        router.push('/');
      }
    }

    loadCreator();
  }, [params?.id, router]);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

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

  const playAudioForIndex = (index) => {
    if (!creator || !creator.musicPreviews || !creator.musicPreviews[index]) {
      stopAudio();
      return;
    }

    const previewUrl = creator.musicPreviews[index];
    const offset = parseInt(creator.musicOffsets?.[index]) || 0;

    if (currentAudio) {
      currentAudio.pause();
    }

    try {
      const audio = new Audio(previewUrl);
      audio.currentTime = offset;
      audio.loop = true;
      audio.volume = isMuted ? 0 : 0.6;

      audio.play().catch(err => console.log('Audio autoplay blocked:', err));

      audio.ontimeupdate = () => {
        if (audio.currentTime >= offset + 15 || audio.currentTime >= audio.duration) {
          audio.currentTime = offset;
        }
      };

      setCurrentAudio(audio);
      setPlayingIndex(index);
    } catch (err) {
      console.warn('HTML5 Audio is not supported or blocked in this browser:', err);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setPlayingIndex(null);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (currentAudio) {
      currentAudio.volume = nextMuted ? 0 : 0.6;
      if (!nextMuted && currentAudio.paused) {
        currentAudio.play().catch(e => console.log(e));
      }
    }
  };

  const handleMouseEnter = (originalIndex) => {
    if (lightboxImage === null) {
      playAudioForIndex(originalIndex);
    }
  };

  const handleMouseLeave = () => {
    if (lightboxImage === null) {
      stopAudio();
    }
  };

  const handleOpenLightbox = (src, caption, date, index) => {
    setLightboxImage(src);
    setLightboxCaption(caption || '');
    setLightboxDate(date || '');
    setLightboxIndex(index);
    playAudioForIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
    setLightboxCaption('');
    setLightboxDate('');
    setLightboxIndex(null);
    stopAudio();
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
          <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-near-black/5 bg-neutral-100 shadow-lg flex items-center justify-center w-full">
            {creator.images && creator.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={creator.images[0]} 
                alt={creator.name} 
                className="w-full h-auto block transition-transform duration-750 ease-out group-hover:scale-[1.02]" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-neutral-400 gap-2">
                <Sparkles className="w-8 h-8 text-coral/40" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">No cover image uploaded</span>
              </div>
            )}
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
                className="relative overflow-hidden px-8 py-3.5 rounded-full bg-coral text-white text-xs font-bold lowercase tracking-wider flex items-center gap-2 group clickable shadow-md hover:shadow-lg transition-all"
              >
                <div className="absolute inset-0 bg-coral-hover scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <Instagram className="w-4 h-4 animate-pulse" />
                  follow @{creator.instagram.toLowerCase()}
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
          {(!creator.images || creator.images.length <= 1) ? (
            <div className="bg-white border border-near-black/5 rounded-2xl p-12 text-center text-neutral-400 max-w-md mx-auto flex flex-col items-center justify-center">
              <Sparkles className="w-6 h-6 text-coral/40 mb-2" />
              <p className="text-xs font-medium">Aesthetic gallery is currently empty.</p>
              <p className="text-[10px] text-neutral-400 mt-1">Images uploaded to the Creator Studio will appear here.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {creator.images.slice(1).map((src, index) => {
                const originalIndex = index + 1;
                const caption = creator.captions ? (creator.captions[originalIndex] || '') : galleryCaptions[index % galleryCaptions.length];
                const date = creator.dates ? (creator.dates[originalIndex] || 'JUN 2026') : 'JUN 2026';
                const hasMusic = creator.musicPreviews && creator.musicPreviews[originalIndex];
                const isVideo = src && src.includes('&&');
                const videoUrl = isVideo ? src.split('&&')[0] : '';
                const posterUrl = isVideo ? src.split('&&')[1] : src;

                return (
                  <div 
                    key={index} 
                    onMouseEnter={() => handleMouseEnter(originalIndex)}
                    onMouseLeave={handleMouseLeave}
                    className="break-inside-avoid mb-6 relative group overflow-hidden rounded-xl border border-near-black/5 bg-neutral-100 shadow-md cursor-pointer clickable"
                  >
                    {isVideo ? (
                      <LazyVideoPlayer 
                        videoSrc={videoUrl} 
                        posterSrc={posterUrl} 
                        alt={`${creator.name} Gallery Video ${index + 1}`} 
                        onClick={() => handleOpenLightbox(src, caption, date, originalIndex)}
                      />
                    ) : (
                      <div onClick={() => handleOpenLightbox(src, caption, date, originalIndex)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={src} 
                          alt={`${creator.name} Gallery Photo ${index + 1}`} 
                          loading="lazy"
                          className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] block" 
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex justify-between items-start w-full">
                        {hasMusic ? (
                          <div className="flex items-center gap-1 bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full text-white">
                            <span className="text-[7px] font-bold tracking-widest uppercase truncate max-w-[80px]">
                              🎵 {creator.musicTracks?.[originalIndex] || ''}
                            </span>
                            {playingIndex === originalIndex && !isMuted ? (
                              <div className="flex gap-[1px] items-end h-1.5 w-1.5 pb-0.5 animate-pulse">
                                <div className="w-[1px] bg-coral h-full" />
                                <div className="w-[1px] bg-coral h-[60%]" />
                                <div className="w-[1px] bg-coral h-[80%]" />
                              </div>
                            ) : null}
                          </div>
                        ) : <div />}
                        {date && (
                          <span className="text-white text-[8px] font-bold uppercase tracking-widest bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            {date}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center w-full">
                        {creator.locations?.[originalIndex] ? (
                          <span className="text-white text-[7px] font-bold uppercase tracking-widest bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-0.5">
                            📍 {creator.locations[originalIndex]}
                          </span>
                        ) : <div />}
                        <span className="text-white text-[9px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-full select-none">
                          Zoom View
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            onClick={handleCloseLightbox}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close Lightbox */}
            <button 
              onClick={handleCloseLightbox}
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
              {lightboxImage && lightboxImage.includes('&&') ? (
                <video 
                  src={lightboxImage.split('&&')[0]} 
                  poster={lightboxImage.split('&&')[1]}
                  controls 
                  autoPlay 
                  loop
                  playsInline
                  className="w-auto h-auto max-w-full max-h-[75vh] object-contain block" 
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={lightboxImage} 
                  alt="Lightbox Zoom" 
                  className="w-auto h-auto max-w-full max-h-[75vh] object-contain" 
                />
              )}
            </motion.div>

            {/* Lightbox Caption & Date & Music */}
            {(lightboxCaption || lightboxDate || (lightboxIndex !== null && creator?.musicTracks?.[lightboxIndex])) && (
              <div className="text-center mt-6 max-w-md px-4 flex flex-col items-center gap-1.5 select-none">
                {lightboxIndex !== null && creator?.musicTracks?.[lightboxIndex] && (
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-white/90 border border-white/10 mb-1">
                    <span className="text-[8px] font-bold tracking-widest uppercase">
                      🎵 {creator.musicTracks?.[lightboxIndex]} - {creator.musicArtists?.[lightboxIndex] || ''}
                    </span>
                    {!isMuted ? (
                      <div className="flex gap-[1px] items-end h-1.5 w-1.5 pb-0.5 animate-pulse">
                        <div className="w-[1px] bg-coral h-full" />
                        <div className="w-[1px] bg-coral h-[60%]" />
                        <div className="w-[1px] bg-coral h-[80%]" />
                      </div>
                    ) : null}
                  </div>
                )}
                {(lightboxDate || (lightboxIndex !== null && creator?.locations?.[lightboxIndex])) && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-inter flex items-center gap-1.5 justify-center">
                    {lightboxDate && <span>{lightboxDate}</span>}
                    {lightboxDate && lightboxIndex !== null && creator?.locations?.[lightboxIndex] && (
                      <span className="text-neutral-500">&bull;</span>
                    )}
                    {lightboxIndex !== null && creator?.locations?.[lightboxIndex] && (
                      <span>📍 {creator.locations[lightboxIndex]}</span>
                    )}
                  </span>
                )}
                {lightboxCaption && (
                  <p className="text-white/80 font-cormorant italic text-lg md:text-xl leading-normal">
                    {lightboxCaption}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sound Toggle Control */}
      {creator && creator.musicPreviews && creator.musicPreviews.some(p => p) && (
        <div 
          onClick={toggleMute}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FBF9F6]/90 border border-near-black/5 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-lg select-none cursor-pointer group"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-400 group-hover:text-coral transition-colors" />
          ) : (
            <Volume2 className="w-4 h-4 text-coral animate-pulse" />
          )}
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-500 font-inter">
            {isMuted ? 'Mute' : 'Sound On'}
          </span>
        </div>
      )}
    </div>
  );
}
