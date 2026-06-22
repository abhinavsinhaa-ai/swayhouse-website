'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Instagram, Mail, ShieldAlert, Award, Compass, HeartHandshake, MessageSquare } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import WhatToExpect from '@/components/WhatToExpect';
import CreatorModal from '@/components/CreatorModal';
import { ROSTER } from '@/utils/roster';
import { supabase } from '@/utils/supabase';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCreator, setActiveCreator] = useState(null);
  const [rosterList, setRosterList] = useState(ROSTER);
  
  // Load dynamic roster from Supabase
  useEffect(() => {
    async function loadDynamicRoster() {
      try {
        const { data: dbCreators, error } = await supabase
          .from('creator_profiles')
          .select('id, name, age, location, instagram, niche, bio, message, images')
          .order('created_at', { ascending: true });

        if (dbCreators && dbCreators.length > 0 && !error) {
          // Merge database creators with static ROSTER (DB values override static)
          const merged = [...ROSTER];
          dbCreators.forEach((dbCreator) => {
            const index = merged.findIndex((c) => 
              c.id.toLowerCase().trim() === dbCreator.id.toLowerCase().trim() ||
              (c.instagram && dbCreator.instagram && c.instagram.toLowerCase().trim().replace('@', '') === dbCreator.instagram.toLowerCase().trim().replace('@', '')) ||
              (c.name && dbCreator.name && c.name.toLowerCase().trim() === dbCreator.name.toLowerCase().trim())
            );
            if (index !== -1) {
              merged[index] = dbCreator;
            } else {
              merged.push(dbCreator);
            }
          });
          setRosterList(merged);
        }
      } catch (err) {
        console.warn('Failed to load dynamic roster from database, using static fallback:', err);
      }
    }
    loadDynamicRoster();
  }, []);

  const heroRef = useRef(null);
  const aboutHeadingRef = useRef(null);

  // Monitor scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP animations for logo and letter splits on load
  useEffect(() => {
    // 1. Logo animation on load
    gsap.fromTo('.logo-element', 
      { opacity: 0, scale: 0.8 }, 
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.2 }
    );

    // 2. Parallax effect on Hero Section subtext (only on desktop to optimize mobile scroll performance)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      gsap.to('.hero-parallax', {
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: 60,
        opacity: 0.3,
        ease: 'none'
      });
    }
  }, []);

  // Text Splitting Typing Animation variables (Framer Motion)
  const youCreateText = "You Create.";
  const weElevateText = "We Elevate.";

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const letterVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1, 
      transition: { duration: 0.02, ease: 'easeOut' } 
    }
  };

  const fadeUpVariants = {
    initial: { opacity: 0, y: 30 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <main className="min-h-screen relative selection:bg-coral selection:text-white">
      
      {/* ===== HEADER / NAVIGATION ===== */}
      <header className={`fixed top-0 left-0 w-full h-[72px] z-[1000] flex items-center transition-all duration-500 ${
        scrolled ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-near-black/5' : 'bg-transparent'
      }`}>
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group logo-element clickable">
            <svg className="w-[34px] h-[30px] flex-shrink-0 text-coral" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <motion.path 
                d="M12 32 V19 L20 11 L28 19 V32 H12 Z" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinejoin="round" 
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
              <motion.path 
                d="M3 24 C 13 13, 27 33, 37 22" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
              />
            </svg>
            <span className="font-inter text-lg font-extrabold tracking-tight text-near-black">
              SwayHouse
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Services', 'Creators', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-near-black transition-colors link-hover-draw py-1"
              >
                {item}
              </a>
            ))}
            
            <a 
              href="#swayai"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('open-swayai'));
              }}
              className="text-xs font-semibold uppercase tracking-wider text-coral hover:text-coral-hover transition-colors flex items-center gap-1.5 py-1 relative"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SwayAI</span>
              <span className="flex h-1.5 w-1.5 relative -top-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-coral"></span>
              </span>
            </a>

            <a 
              href="#what-to-expect" 
              className="relative overflow-hidden px-4 py-2 rounded-full bg-coral text-white text-[10px] font-bold uppercase tracking-wider hover:shadow-[0_4px_15px_rgba(255,107,53,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 group clickable"
            >
              <div className="absolute inset-0 bg-coral-hover scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10">What to Expect</span>
            </a>

            <div className="flex items-center gap-4 border-l border-near-black/10 pl-6 ml-2">
              <a 
                href="https://instagram.com/swayhousehq" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-coral transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="w-[18px] h-[18px]" />
              </a>
              <a 
                href="mailto:hello@swayhouse.in"
                className="text-neutral-500 hover:text-coral transition-colors p-1"
                aria-label="Email"
              >
                <Mail className="w-[18px] h-[18px]" />
              </a>
            </div>
          </nav>

          {/* Mobile Hamburguer */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 z-[1001] outline-none"
            aria-label="Toggle Menu"
          >
            <span className={`w-6 h-[2px] bg-near-black rounded transition-all duration-350 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''
            }`} />
            <span className={`w-6 h-[2px] bg-near-black rounded transition-all duration-350 ${
              mobileMenuOpen ? 'opacity-0 scale-0' : ''
            }`} />
            <span className={`w-6 h-[2px] bg-near-black rounded transition-all duration-350 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''
            }`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {['Home', 'About', 'Services', 'Creators', 'Contact'].map((item, index) => (
              <motion.a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
                className="font-cormorant text-4xl font-bold text-near-black hover:text-coral transition-colors"
              >
                {item}
              </motion.a>
            ))}
            
            <motion.a 
              href="#what-to-expect"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5 * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="px-6 py-2.5 rounded-full bg-coral text-white text-sm font-bold uppercase tracking-wider hover:bg-coral-hover transition-colors"
            >
              What to Expect
            </motion.a>

            <motion.a 
              href="#swayai"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-swayai'));
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6 * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="px-6 py-2.5 rounded-full border border-coral text-coral text-sm font-bold uppercase tracking-wider hover:bg-coral hover:text-white transition-colors"
            >
              Talk to SwayAI ✨
            </motion.a>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex gap-6 mt-6 border-t border-near-black/5 pt-8 w-2/3 justify-center"
            >
              <a href="https://instagram.com/swayhousehq" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-coral transition-all">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="mailto:hello@swayhouse.in" className="text-neutral-500 hover:text-coral transition-all">
                <Mail className="w-6 h-6" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SECTION 1 — HERO ===== */}
      <section 
        id="home" 
        ref={heroRef}
        className="min-h-screen flex flex-col justify-between items-center text-center relative pt-[72px] pb-10"
      >
        {/* Spacer */}
        <div className="h-4" />

        <div className="max-w-[900px] px-6 mx-auto flex flex-col items-center hero-parallax my-auto">
          {/* Headline Container */}
          <h1 className="font-cormorant text-[clamp(2.75rem,8vw,5.5rem)] font-light leading-[1.05] tracking-tight text-near-black mb-8 select-none">
            {/* You Create. */}
            <motion.span 
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="block overflow-hidden h-[1.15em] py-1"
            >
              {youCreateText.split('').map((char, index) => (
                <motion.span key={index} variants={letterVariants} className="inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.span>

            {/* We Elevate. */}
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: 'easeOut' }}
              className="block text-coral relative inline-block pb-3 mt-1"
            >
              We Elevate.
              {/* Bottom underline drawings */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-0 w-full h-[2.5px] bg-coral origin-left"
              />
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.8, ease: 'easeOut' }}
            className="text-base md:text-lg text-neutral-500 leading-snug max-w-[650px] mb-12"
          >
            SwayHouse is a creator management company built for the new era of content. 
            We handle the business so you never have to stop creating.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center mt-4 w-full"
          >
            {/* Explore Our Creators */}
            <a 
              href="#creators" 
              className="relative overflow-hidden px-8 py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(255,107,53,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group min-w-[200px] text-center clickable"
            >
              <div className="absolute inset-0 bg-coral-hover scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Our Creators
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </a>

            {/* Our Services */}
            <a 
              href="#services" 
              className="relative overflow-hidden px-8 py-4 rounded-full bg-white border border-near-black/10 text-near-black text-xs font-bold uppercase tracking-wider hover:border-coral hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group min-w-[200px] text-center clickable"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Our Services
                <Compass className="w-4 h-4 text-coral transition-colors" />
              </span>
            </a>

            {/* Contact Us */}
            <a 
              href="#contact" 
              className="relative overflow-hidden px-8 py-4 rounded-full bg-white border border-near-black/10 text-near-black text-xs font-bold uppercase tracking-wider hover:border-coral hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group min-w-[200px] text-center clickable"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Contact Us
                <Mail className="w-4 h-4 text-coral transition-colors" />
              </span>
            </a>
          </motion.div>
        </div>

        {/* Hero Footer Divider */}
        <div className="w-full px-6 md:px-10 flex flex-col items-center gap-6 select-none mt-12">
          <div className="w-full max-w-[1200px] h-[1px] bg-near-black/5" />
          <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
            Strategy. &nbsp; Partnerships. &nbsp; Growth.
          </p>
        </div>
      </section>

      {/* ===== SECTION 2 — ABOUT ===== */}
      <section id="about" className="py-24 md:py-36 border-t border-near-black/5">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start mb-24">
            {/* Left Headline */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-cormorant text-4xl md:text-5xl font-light text-near-black leading-snug">
                We&apos;re not an agency.<br />
                <span className="italic text-coral font-medium">We&apos;re your business partner.</span>
              </h2>
            </motion.div>

            {/* Right paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="text-base md:text-md text-neutral-500 leading-normal"
            >
              <p>
                SwayHouse was built on a simple belief — that creators shouldn&apos;t have to choose between making great content and building a sustainable career. We sit between you and the commercial world, handling brand relationships, negotiations, and strategy so your creative energy stays exactly where it belongs. We&apos;re starting small, intentionally. One creator at a time, done right.
              </p>
            </motion.div>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 border-t border-near-black/5">
            {/* Pillar 1 */}
            <motion.div 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              variants={fadeUpVariants}
              className="flex flex-col gap-4 group"
            >
              <div className="w-10 h-10 text-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <motion.circle 
                    cx="12" cy="12" r="10" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                  <motion.circle 
                    cx="12" cy="12" r="6" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <motion.circle 
                    cx="12" cy="12" r="2" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.4 }}
                  />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl font-bold text-near-black">Deep Focus</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-snug">
                We don&apos;t spread thin. Every creator we work with gets our full, undivided attention.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              variants={fadeUpVariants}
              className="flex flex-col gap-4 group"
            >
              <div className="w-10 h-10 text-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <motion.polygon 
                    points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  />
                  <motion.line 
                    x1="9" y1="18" x2="9" y2="3" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.3 }}
                  />
                  <motion.line 
                    x1="15" y1="21" x2="15" y2="6" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.5 }}
                  />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl font-bold text-near-black">Real Strategy</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-snug">
                No generic templates. Growth plans custom-tailored around your niche, content matrix, and long-term career goals.
              </p>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              variants={fadeUpVariants}
              className="flex flex-col gap-4 group"
            >
              <div className="w-10 h-10 text-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <motion.path 
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                  <motion.circle 
                    cx="9" cy="7" r="4" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <motion.path 
                    d="M23 21v-2a4 4 0 0 0-3-3.87" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.4 }}
                  />
                  <motion.path 
                    d="M16 3.13a4 4 0 0 1 0 7.75" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeInOut', delay: 0.6 }}
                  />
                </svg>
              </div>
              <h3 className="font-cormorant text-xl font-bold text-near-black">Honest Partnership</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-snug">
                No bloated claims or hidden percentages. Just consistent execution, transparent reporting, and compound results.
              </p>
            </motion.div>
          </div>

        </div>
      </section>


      {/* ===== SECTION 3 — SERVICES ===== */}
      <section id="services" className="py-24 md:py-36 bg-white/50 border-t border-b border-near-black/5">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10">
          
          <div className="mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="font-cormorant text-4xl md:text-5xl font-light text-near-black mb-3"
            >
              What We Do
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.8, ease: 'easeOut' }}
              className="text-base text-neutral-500 max-w-[550px]"
            >
              The business side of being a creator is a full-time job. We handle everything else so you can stay creative.
            </motion.p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: "Niche & Growth Strategy",
                desc: "We identify exactly where you belong, audit your content footprint, and structure a custom production matrix to scale your active reach.",
                icon: <Compass className="w-6 h-6" />
              },
              {
                title: "Brand Deal Sourcing",
                desc: "We research and pitch brands that align with your unique audience. No generic cold emails — just targeted, high-value commercial deals.",
                icon: <Award className="w-6 h-6" />
              },
              {
                title: "Negotiation & Contracts",
                desc: "We run all commercial negotiations, protect your creative rights, review legal terms, and secure premium rates on every deal.",
                icon: <ShieldAlert className="w-6 h-6" />
              },
              {
                title: "Ongoing Management",
                desc: "From content calendars to billing pipelines and operational assistance — we streamline your creator ecosystem end-to-end.",
                icon: <HeartHandshake className="w-6 h-6" />
              }
            ].map((srv, idx) => (
              <motion.div 
                key={srv.title}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-xl p-8 border border-near-black/5 flex flex-col justify-between min-h-[240px] hover:-translate-y-1.5 hover:shadow-xl hover:border-transparent transition-all duration-300 relative group overflow-hidden"
              >
                {/* Left Border Draw on Hover */}
                <div className="absolute top-0 left-0 w-[3px] h-full bg-coral scale-y-0 group-hover:scale-y-100 origin-bottom group-hover:origin-top transition-transform duration-400 ease-out" />
                
                <div>
                  <div className="w-12 h-12 rounded-lg bg-coral/10 text-coral flex items-center justify-center mb-6">
                    {srv.icon}
                  </div>
                  <h3 className="font-cormorant text-xl font-bold text-near-black mb-3">{srv.title}</h3>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">{srv.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scale in Audit Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 md:mt-24 p-8 md:p-12 bg-coral rounded-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-lg overflow-hidden relative"
          >
            <div className="relative z-10 max-w-[650px]">
              <h3 className="font-cormorant text-2xl md:text-3xl font-semibold mb-2">
                Not sure if you&apos;re ready for management?
              </h3>
              <p className="text-xs md:text-sm opacity-90 leading-snug">
                Get a free, comprehensive Creator Niche Audit to evaluate your channels. No strings attached.
              </p>
            </div>
            
            <a 
              href="#contact" 
              className="relative z-10 px-8 py-3.5 rounded-full bg-white text-coral text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse-slow clickable shadow-md"
            >
              Claim Your Free Audit
            </a>
          </motion.div>

        </div>
      </section>


      {/* ===== SECTION 4 — CREATORS ===== */}
      <section id="creators" className="py-24 md:py-36 bg-white overflow-hidden">
        {/* Injecting dynamic bento styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .roster-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            width: 100%;
          }
          .roster-grid.roster-size-1 {
            display: flex;
            justify-content: center;
          }
          .roster-grid.roster-size-1 a {
            width: 100%;
            max-width: 420px;
            height: auto;
          }
          @media (min-width: 768px) {
            .roster-grid.roster-size-multi {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(4, 240px);
              grid-template-areas:
                "large1 large1 small1"
                "large1 large1 small2"
                "small3 large2 large2"
                "small4 large2 large2";
              grid-auto-flow: dense;
            }
            /* Named template grid areas for bento-style reflow */
            .roster-grid.roster-size-multi .card-grid-0 { grid-area: large1; }
            .roster-grid.roster-size-multi .card-grid-1 { grid-area: small1; }
            .roster-grid.roster-size-multi .card-grid-2 { grid-area: small2; }
            .roster-grid.roster-size-multi .card-grid-3 { grid-area: small3; }
            .roster-grid.roster-size-multi .card-grid-4 { grid-area: small4; }
            .roster-grid.roster-size-multi .card-grid-5 { grid-area: large2; }
            
            .roster-grid.roster-size-multi a {
              min-height: 100%;
            }
            
            /* 2 Creators Grid Layout */
            .roster-grid.roster-size-2 {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              max-width: 800px;
              margin-left: auto;
              margin-right: auto;
            }
            .roster-grid.roster-size-2 a {
              height: auto;
            }
            
            /* 3 Creators Grid Layout */
            .roster-grid.roster-size-3 {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
            }
            .roster-grid.roster-size-3 a {
              height: auto;
            }
          }
        `}} />

        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10">
          {/* Header Spread */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-near-black/5 pb-8">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-coral font-inter mb-4">
                <span>OUR ROSTER</span>
                <span className="w-8 h-[1px] bg-coral"></span>
              </div>
              <h2 className="font-cormorant text-5xl md:text-7xl font-light text-near-black leading-none">
                The talent.
              </h2>
            </div>
            <div className="text-left md:text-right text-xs md:text-sm text-neutral-400 font-inter italic">
              Intentionally small. Exceptionally managed.
            </div>
          </div>

          {/* Asymmetric bento-style grid */}
          <div className={`roster-grid mb-20 roster-size-${rosterList.length > 3 ? 'multi' : rosterList.length}`}>
            {rosterList.map((creator, index) => {
              const cardGridClass = `card-grid-${index % 6}`;
              const isLarge = (index % 6 === 0 || index % 6 === 5);
              return (
                <Link 
                  key={creator.id}
                  href={`/creators/${creator.id}`}
                  data-cursor="view"
                  className={`w-full group rounded-[24px] bg-white border border-near-black/5 p-5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col ${cardGridClass}`}
                >
                  <motion.div 
                    initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0, y: 40 }}
                    whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: (index % 6) * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex flex-col"
                  >
                    {/* Image container */}
                    <div className="w-full aspect-[4/3.2] relative overflow-hidden rounded-xl bg-neutral-100 flex-shrink-0">
                      <Image 
                        src={creator.images[0]} 
                        alt={creator.name} 
                        fill
                        priority={index === 0}
                        sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        className="object-cover group-hover:scale-[1.03] transition-all duration-500 ease-in-out"
                      />
                    </div>

                    {/* Content Section below the picture */}
                    <div className="mt-5 flex flex-col items-start text-left w-full">
                      {/* Managed Badge */}
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-coral bg-coral/5 px-3 py-1 rounded-md mb-3 select-none">
                        Managed by SwayHouse
                      </span>
                      
                      {/* Name */}
                      <h3 className="font-cormorant text-[32px] font-bold text-near-black leading-tight mb-2">
                        {creator.name}
                      </h3>

                      {/* Details row */}
                      <div className="flex items-center gap-8 text-[11px] uppercase tracking-wider mb-2 font-inter">
                        <div>
                          <div className="text-[9px] font-bold text-neutral-400 tracking-wider">NICHE</div>
                          <div className="font-bold text-near-black mt-0.5">{creator.niche}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-neutral-400 tracking-wider">PLATFORM</div>
                          <div className="font-bold text-near-black mt-0.5 flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5 text-coral" />
                            Instagram
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-[1px] bg-near-black/5 my-3" />

                      {/* Short Bio */}
                      <p className="text-xs text-neutral-500 leading-relaxed font-inter">
                        {creator.bio}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Editorial Closing Spread */}
          <div className="text-center flex flex-col items-center mt-12">
            {/* Animated Horizontal Rule */}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-1/4 h-[1px] bg-coral/30 mb-8"
            />
            
            <p className="font-cormorant italic text-lg md:text-xl text-neutral-500 mb-8 select-none">
              Roster growing by design — not by volume.
            </p>

            <Link 
              href="#contact" 
              className="inline-block border border-coral text-coral hover:bg-coral hover:text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 clickable"
            >
              Apply for Management &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* ===== SECTION 4.5 — EXPECTATIONS ===== */}
      <WhatToExpect />
      
      {/* ===== SECTION 5 — CONTACT ===== */}
      <section id="contact" className="py-24 md:py-36 bg-soft-white border-t border-near-black/5">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24 items-start">
            
            {/* Left Column content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:sticky lg:top-[120px]"
            >
              <h2 className="font-cormorant text-4xl md:text-5xl font-light text-near-black mb-6">
                Let&apos;s Talk
              </h2>
              <p className="text-base text-neutral-500 leading-snug mb-12 max-w-[480px]">
                Whether you&apos;re a creator looking for management or a brand looking to collaborate — we reply within 24 hours.
              </p>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Us</span>
                  <a href="mailto:hello@swayhouse.in" className="text-base font-semibold text-near-black hover:text-coral transition-colors w-max clickable">
                    hello@swayhouse.in
                  </a>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Follow Us</span>
                  <a 
                    href="https://instagram.com/swayhousehq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-near-black hover:text-coral transition-colors w-max clickable"
                  >
                    @swayhousehq
                  </a>
                </div>
              </div>

              {/* Instagram Prominent Card */}
              <div className="mt-12 p-6 bg-coral/5 border border-coral/10 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-coral/10 text-coral flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-near-black mb-1">Prefer Instagram?</h4>
                  <p className="text-xs text-neutral-500 leading-normal mb-3">
                    You can DM us directly on Instagram. We check our inbox constantly and respond within 12 hours.
                  </p>
                  <a 
                    href="https://instagram.com/swayhousehq" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-coral hover:text-coral-hover transition-colors clickable"
                  >
                    DM us @swayhousehq
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right Column Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            >
              <ContactForm />
            </motion.div>

          </div>
        </div>
      </section>


      {/* ===== FOOTER ===== */}
      <footer className="py-16 md:py-24 border-t border-near-black/10 bg-white">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pb-12 border-b border-near-black/5">
            {/* Brand Logo */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <svg className="w-7 h-6 text-coral" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 32 V19 L20 11 L28 19 V32 H12 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
                <path d="M3 24 C 13 13, 27 33, 37 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
              <span className="text-base font-extrabold tracking-tight">SwayHouse</span>
            </motion.div>

            {/* Nav links */}
            <nav className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
              {['Home', 'About', 'Services', 'Creators', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-near-black transition-colors link-hover-draw py-0.5"
                >
                  {item}
                </a>
              ))}
              <a 
                href="#what-to-expect"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-near-black transition-colors link-hover-draw py-0.5"
              >
                Expectations
              </a>
            </nav>

            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/swayhousehq" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-near-black/10 text-neutral-500 flex items-center justify-center hover:text-coral hover:border-coral hover:bg-coral/5 transition-all duration-300 hover:scale-105 clickable"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="mailto:hello@swayhouse.in"
                className="w-10 h-10 rounded-full border border-near-black/10 text-neutral-500 flex items-center justify-center hover:text-coral hover:border-coral hover:bg-coral/5 transition-all duration-300 hover:scale-105 clickable"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-6 select-none">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-[11px] text-neutral-400">
                &copy; 2026 SwayHouse. All rights reserved.
              </p>
              <Link 
                href="/creators/login" 
                className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors clickable"
              >
                Creator Portal
              </Link>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-1.5">
              <p className="font-cormorant italic text-sm text-neutral-400">
                You create. We elevate.
              </p>
              <a href="mailto:hello@swayhouse.in" className="text-[10px] font-semibold tracking-wider text-neutral-400 hover:text-coral transition-colors clickable">
                hello@swayhouse.in
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Creator profile dashboard modal overlay */}
      <CreatorModal 
        creator={activeCreator} 
        onClose={() => setActiveCreator(null)} 
      />

    </main>
  );
}
