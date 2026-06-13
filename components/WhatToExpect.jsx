"use client";

import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Sparkles, Briefcase, HelpCircle, PhoneCall } from 'lucide-react';

export default function WhatToExpect() {
  const fadeUpVariants = {
    initial: { opacity: 0, y: 30 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
    viewport: { once: true, margin: "-100px" }
  };

  const creatorsDo = [
    "Position you in the market with a custom brand & content distribution strategy",
    "Handle all incoming brand communications and pitch targeted partnerships",
    "Manage contracts, legal terms, and negotiate premium commercial rates",
    "Provide operational support (billing, calendars) to free up your creative time"
  ];

  const creatorsDont = [
    "We do not use templates — every strategy is hand-tailored to your unique niche",
    "We do not work with hidden fees — pricing negotiations are transparent and private",
    "We do not buy fake followers or use inorganic growth tactics"
  ];

  const creatorsFor = [
    "Creators serious about scaling their personal brand professionally",
    "Creators seeking a dedicated business partner to handle operations"
  ];

  const creatorsHow = [
    "Reach out through the contact form or Instagram",
    "15-minute discovery call to evaluate alignment",
    "Execute structured custom growth and campaign strategy"
  ];

  const brandsDo = [
    "Match your campaigns with highly aligned creators who fit your goals",
    "Streamline campaign execution from selection to final content delivery",
    "Handle all talent-side communication, contract compliance, and reporting",
    "Save campaign hours by acting as a single, organized point of contact"
  ];

  const brandsDont = [
    "We do not spam mass creators — we pitch only selective, vetted matches",
    "We do not misrepresent engagement or creator channel metrics",
    "We do not add layer upon layer of agency overhead"
  ];

  const brandsFor = [
    "Brands looking for reliable, structured creator collaborations",
    "Marketing teams seeking a professional, high-touch agency partner"
  ];

  const brandsHow = [
    "Submit brief via contact form or email",
    "Brief alignment call to establish requirements",
    "Seamless execution and managed campaign delivery"
  ];

  return (
    <section id="what-to-expect" className="py-24 md:py-36 border-t border-near-black/5 bg-white relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="mb-20 text-center select-none">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-cormorant text-4xl md:text-5xl font-light text-near-black mb-4"
          >
            What to Expect From Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8, ease: 'easeOut' }}
            className="text-base text-neutral-500 max-w-[600px] mx-auto leading-normal"
          >
            Clear support for creators. Clear value for brands. No fluff, no confusion.
          </motion.p>
        </div>

        {/* Dual Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-24">
          
          {/* Creators Card */}
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="bg-soft-white border border-near-black/5 rounded-2xl p-8 md:p-12 hover:shadow-xl hover:border-coral/10 transition-all duration-300 relative group"
          >
            <div className="absolute top-0 left-0 w-full h-[4px] bg-coral rounded-t-2xl"></div>
            
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl md:text-3xl font-bold text-near-black">For Creators</h3>
            </div>

            {/* What We Do */}
            <div className="mb-8">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-coral mb-4 flex items-center gap-1.5">
                <span>●</span> What We Do
              </h4>
              <ul className="flex flex-col gap-3">
                {creatorsDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-neutral-600 leading-snug">
                    <Check className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Don't Do */}
            <div className="mb-8 pt-6 border-t border-near-black/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-near-black mb-4 flex items-center gap-1.5">
                <span>●</span> What We Don&apos;t Do
              </h4>
              <ul className="flex flex-col gap-3">
                {creatorsDont.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-neutral-400 leading-snug">
                    <X className="w-4 h-4 text-near-black flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who This Is For */}
            <div className="mb-8 pt-6 border-t border-near-black/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-4">Who This Is For</h4>
              <ul className="list-disc pl-4 flex flex-col gap-2 text-xs md:text-sm text-neutral-600 leading-snug">
                {creatorsFor.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* How It Works */}
            <div className="mb-10 pt-6 border-t border-near-black/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-6">How It Works</h4>
              <div className="flex flex-col gap-5 relative pl-4 border-l border-near-black/5">
                {creatorsHow.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    <div className="absolute -left-[25px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border border-near-black/10 flex items-center justify-center text-[9px] font-bold text-neutral-500">
                      {idx + 1}
                    </div>
                    <span className="text-xs md:text-sm text-neutral-600 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="pt-6 border-t border-near-black/5 flex flex-col gap-4">
              <p className="text-xs text-neutral-400 font-semibold italic">Contact us for a one-on-one call</p>
              <a 
                href="#contact" 
                className="relative overflow-hidden px-8 py-3.5 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider text-center group w-full sm:w-max clickable"
              >
                <div className="absolute inset-0 bg-coral-hover scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Book a Call
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>

          </motion.div>

          {/* Brands Card */}
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="bg-soft-white border border-near-black/5 rounded-2xl p-8 md:p-12 hover:shadow-xl hover:border-coral/10 transition-all duration-300 relative group"
          >
            <div className="absolute top-0 left-0 w-full h-[4px] bg-near-black rounded-t-2xl"></div>
            
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-12 h-12 rounded-xl bg-near-black/5 text-near-black flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl md:text-3xl font-bold text-near-black">For Brands</h3>
            </div>

            {/* What We Do */}
            <div className="mb-8">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-coral mb-4 flex items-center gap-1.5">
                <span>●</span> What We Do
              </h4>
              <ul className="flex flex-col gap-3">
                {brandsDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-neutral-600 leading-snug">
                    <Check className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Don't Do */}
            <div className="mb-8 pt-6 border-t border-near-black/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-near-black mb-4 flex items-center gap-1.5">
                <span>●</span> What We Don&apos;t Do
              </h4>
              <ul className="flex flex-col gap-3">
                {brandsDont.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-neutral-400 leading-snug">
                    <X className="w-4 h-4 text-near-black flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who This Is For */}
            <div className="mb-8 pt-6 border-t border-near-black/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-4">Who This Is For</h4>
              <ul className="list-disc pl-4 flex flex-col gap-2 text-xs md:text-sm text-neutral-600 leading-snug">
                {brandsFor.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* How It Works */}
            <div className="mb-10 pt-6 border-t border-near-black/5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-6">How It Works</h4>
              <div className="flex flex-col gap-5 relative pl-4 border-l border-near-black/5">
                {brandsHow.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    <div className="absolute -left-[25px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border border-near-black/10 flex items-center justify-center text-[9px] font-bold text-neutral-500">
                      {idx + 1}
                    </div>
                    <span className="text-xs md:text-sm text-neutral-600 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="pt-6 border-t border-near-black/5 flex flex-col gap-4">
              <p className="text-xs text-neutral-400 font-semibold italic">Contact us for a one-on-one call</p>
              <a 
                href="#contact" 
                className="relative overflow-hidden px-8 py-3.5 rounded-full bg-near-black text-white text-xs font-bold uppercase tracking-wider text-center group w-full sm:w-max clickable"
              >
                <div className="absolute inset-0 bg-neutral-800 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start a Conversation
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>

          </motion.div>
        </div>

        {/* Before & After Trust Subsections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-16 border-t border-near-black/5">
          
          {/* Before You Reach Out */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex gap-4 items-start"
          >
            <div className="w-10 h-10 rounded-full bg-coral/5 text-coral flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cormorant text-xl font-bold text-near-black mb-2">Before You Reach Out</h3>
              <p className="text-xs md:text-sm text-neutral-500 leading-normal max-w-md">
                We value quality over volume. SwayHouse is focused on deep partnership because we only work with creators and brands that are serious about executing structure and long-term values. We choose transparent partnership alignment over quick, empty transactions.
              </p>
            </div>
          </motion.div>

          {/* After You Contact Us */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex gap-4 items-start"
          >
            <div className="w-10 h-10 rounded-full bg-near-black/5 text-near-black flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cormorant text-xl font-bold text-near-black mb-2">After You Contact Us</h3>
              <p className="text-xs md:text-sm text-neutral-500 leading-normal max-w-md">
                Once you send a message, we review it within 24 hours. If there is a potential fit, we set up a 15-minute Google Meet discovery call. If needed, we can also connect and continue our conversation directly through Instagram DM to keep things simple.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Global CTA Strip */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mt-20 p-8 md:p-12 bg-coral rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10 max-w-[600px]">
            <h3 className="font-cormorant text-2xl md:text-3xl font-semibold mb-2">
              Ready to talk?
            </h3>
            <p className="text-xs md:text-sm opacity-90 leading-snug">
              Contact us for a one-on-one call. Let&apos;s see how we can build together.
            </p>
          </div>
          
          <a 
            href="#contact" 
            className="relative z-10 px-8 py-4 rounded-full bg-white text-coral text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all clickable shadow-md text-center"
          >
            Contact Us Now
          </a>
        </motion.div>

      </div>
    </section>
  );
}
