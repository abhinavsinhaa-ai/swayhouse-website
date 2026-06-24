'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowLeft, ArrowRight, Instagram, Mail, Compass, HelpCircle, Loader2, Check, Mic, Send } from 'lucide-react';

export default function SwayAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu'); // menu | info | audit_form | pitch_form | chat_session | loading
  const [resultText, setResultText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [actionType, setActionType] = useState(''); // audit | pitch | chat

  const [sessionId, setSessionId] = useState('');
  // Chat conversation history
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hii! I’m SwayAI. Ask me anything about SwayHouse, creator growth, or how we manage brand deals!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Initialize unique session ID on mount
  useEffect(() => {
    setSessionId('sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36));
  }, []);

  // Info section search input state
  const [infoSearch, setInfoSearch] = useState('');
  const [infoSearchResponse, setInfoSearchResponse] = useState('');
  const [infoSearchLoading, setInfoSearchLoading] = useState(false);

  // Floating notification bubble states
  const [showCallout, setShowCallout] = useState(true);

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState('chat'); // chat | info
  const recognitionRef = useRef(null);
  const listeningTargetRef = useRef('chat');

  // Audit Form States
  const [auditForm, setAuditForm] = useState({
    handle: '',
    followers: '',
    niche: 'Lifestyle & Feel Good',
    frequency: '3 to 5 times a week',
    goal: ''
  });

  // Pitch Form States
  const [pitchForm, setPitchForm] = useState({
    handle: '',
    niche: 'Lifestyle & Feel Good',
    brand: '',
    reason: ''
  });

  const sidebarRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Listen to custom toggle events from the navbar links
  useEffect(() => {
    const handleOpenAI = () => {
      setIsOpen(true);
      setShowCallout(false);
    };
    window.addEventListener('open-swayai', handleOpenAI);
    return () => window.removeEventListener('open-swayai', handleOpenAI);
  }, []);

  // Hide callout bubble on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowCallout(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (listeningTargetRef.current === 'info') {
            setInfoSearch(prev => prev + (prev ? ' ' : '') + transcript);
          } else {
            setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

  // Handle outside click to close
  useEffect(() => {
    function handleOutsideClick(event) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.ai-trigger-btn') && !event.target.closest('a[href="#swayai"]')) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const toggleListening = (target = 'chat') => {
    listeningTargetRef.current = target;
    setListeningTarget(target);
    if (!recognitionRef.current) {
      alert('Voice transcription is not supported in this browser. Please try Google Chrome, Safari, or Microsoft Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Handle general chat message submission
  const handleChatSend = async (textToSend) => {
    const msg = textToSend || chatInput;
    if (!msg.trim()) return;

    // Add user message to history
    const updatedHistory = [...chatHistory, { role: 'user', text: msg }];
    setChatHistory(updatedHistory);
    setChatInput('');
    setChatLoading(true);
    setCurrentScreen('chat_session');
    setErrorText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          details: { message: msg, history: chatHistory.slice(-6), sessionId } // Send last 6 messages for context
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection error');

      setChatHistory([...updatedHistory, { role: 'model', text: data.result }]);
    } catch (err) {
      setChatHistory([...updatedHistory, { role: 'model', text: `⚠️ Error: ${err.message}. Please check your connection.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Ask Us Anything search inside the Info screen
  const handleInfoSearchSubmit = async (e) => {
    e.preventDefault();
    if (!infoSearch.trim()) return;

    setInfoSearchLoading(true);
    setInfoSearchResponse('');
    setErrorText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          details: { message: infoSearch, history: [], sessionId }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection error');

      setInfoSearchResponse(data.result);
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setInfoSearchLoading(false);
    }
  };

  // Handle specific form submissions
  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!auditForm.handle || !auditForm.followers || !auditForm.goal) return;

    setChatLoading(true);
    setActionType('audit');
    setErrorText('');
    setResultText('');
    setCurrentScreen('chat_session');

    // Add user prompt to chat log
    const userMsg = `Generate personalized growth audit for handle: @${auditForm.handle}, followers: ${auditForm.followers}, niche: ${auditForm.niche}, frequency: ${auditForm.frequency}, goal: ${auditForm.goal}`;
    const tempHistory = [...chatHistory, { role: 'user', text: userMsg }];
    setChatHistory(tempHistory);

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit', details: { ...auditForm, sessionId } })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate audit');

      setChatHistory([...tempHistory, { role: 'model', text: data.result }]);
    } catch (err) {
      setChatHistory([...tempHistory, { role: 'model', text: `⚠️ Error: ${err.message}. Please verify the server setup.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePitchSubmit = async (e) => {
    e.preventDefault();
    if (!pitchForm.handle || !pitchForm.brand || !pitchForm.reason) return;

    setChatLoading(true);
    setActionType('pitch');
    setErrorText('');
    setResultText('');
    setCurrentScreen('chat_session');

    const userMsg = `Draft brand pitch email for handle: @${pitchForm.handle}, niche: ${pitchForm.niche}, target brand: ${pitchForm.brand}, value: ${pitchForm.reason}`;
    const tempHistory = [...chatHistory, { role: 'user', text: userMsg }];
    setChatHistory(tempHistory);

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pitch', details: { ...pitchForm, sessionId } })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate brand pitch');

      setChatHistory([...tempHistory, { role: 'model', text: data.result }]);
    } catch (err) {
      setChatHistory([...tempHistory, { role: 'model', text: `⚠️ Error: ${err.message}. Please check your connection.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleBookCall = () => {
    setIsOpen(false);
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
      const creatorBtn = document.querySelector('button[type="button"]');
      if (creatorBtn) creatorBtn.click();
    }
  };

  // Basic Markdown-like renderer for bubble text
  const renderFormattedResult = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      let content = line.trim();
      if (!content) return <div key={idx} className="h-2" />;

      if (content.startsWith('###') || content.startsWith('##') || content.startsWith('#')) {
        const cleanHeader = content.replace(/^[#\s]+/, '');
        return (
          <h4 key={idx} className="font-bold text-sm text-near-black mt-3 mb-1.5 border-b border-near-black/5 pb-0.5">
            {cleanHeader}
          </h4>
        );
      }

      if (content.startsWith('-') || content.startsWith('*') || content.startsWith('●')) {
        const cleanBullet = content.replace(/^[-*●\s]+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-xs text-neutral-600 leading-relaxed">
            <span className="text-coral flex-shrink-0 mt-1 text-[8px]">●</span>
            <span>{parseInlineBold(cleanBullet)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-neutral-500 leading-relaxed my-1">
          {parseInlineBold(content)}
        </p>
      );
    });
  };

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
      {/* ===== FLOATING TRIGGER BUTTON & CALLOUT ===== */}
      <div className="fixed left-4 bottom-4 md:top-24 md:left-6 z-[999] select-none flex items-center gap-2">
        <button
          onClick={() => {
            setIsOpen(true);
            setShowCallout(false);
          }}
          className="ai-trigger-btn flex items-center justify-center w-12 h-12 rounded-full bg-white border border-near-black/5 text-coral shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(255,107,53,0.2)] hover:scale-105 hover:border-coral/20 active:scale-95 transition-all duration-300 relative group"
          aria-label="Launch SwayAI"
        >
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
          <span className="absolute -inset-1 rounded-full bg-coral/10 animate-ping opacity-30 pointer-events-none group-hover:animate-none" />
        </button>

        {/* Floating welcome bubble callout */}
        <AnimatePresence>
          {showCallout && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: [1, 1.03, 1],
                boxShadow: [
                  '0 4px 12px rgba(0, 0, 0, 0.05)',
                  '0 4px 12px rgba(255, 107, 53, 0.15)',
                  '0 4px 12px rgba(0, 0, 0, 0.05)'
                ]
              }}
              transition={{
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                default: { duration: 0.3 }
              }}
              className="bg-white border border-near-black/5 px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-2 relative after:content-[''] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-r-white before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-near-black/5 cursor-pointer hover:border-coral/20"
              onClick={() => {
                setIsOpen(true);
                setShowCallout(false);
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-widest text-near-black flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-coral"></span>
                </span>
                Sway AI
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCallout(false);
                }}
                className="text-neutral-400 hover:text-near-black p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== SIDEBAR PORTAL ===== */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[9998] backdrop-blur-[2px]"
            />

            <motion.div
              ref={sidebarRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 h-screen w-full sm:w-[460px] bg-white border-r border-near-black/5 z-[9999] shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-near-black/5 flex items-center justify-between bg-soft-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-coral/10 text-coral flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-cormorant text-lg font-bold text-near-black">SwayAI</h3>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 block -mt-1">SwayAI Operations Workspace</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full border border-near-black/5 text-neutral-400 hover:text-near-black flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-grow overflow-y-auto p-6 no-scrollbar flex flex-col">
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
                      {/* Top Welcome Title */}
                      <div className="text-left">
                        <h4 className="font-cormorant text-3xl font-light text-near-black mb-1">
                          Welcome to SwayAI
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Your virtual creator economy consultant. Talk to SwayAI below:
                        </p>
                      </div>

                      {/* Main Open Chat Input Box */}
                      <div className="bg-soft-white border border-near-black/5 rounded-2xl p-4 flex flex-col gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-coral">Direct Consult Chat</span>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              placeholder="Ask us anything..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleChatSend();
                              }}
                              className="w-full bg-white border border-near-black/5 rounded-xl pl-4 pr-10 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                            />
                            {/* Voice Microphone icon */}
                            <button
                              type="button"
                              onClick={() => toggleListening('chat')}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                                isListening && listeningTarget === 'chat'
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'text-neutral-400 hover:text-near-black'
                              }`}
                            >
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleChatSend()}
                            className="p-3 bg-near-black text-white hover:bg-neutral-800 rounded-xl transition-all active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3 select-none">
                        <div className="h-[1px] bg-near-black/5 flex-grow" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Quick Actions</span>
                        <div className="h-[1px] bg-near-black/5 flex-grow" />
                      </div>

                      {/* Menu Options Grid */}
                      <div className="flex flex-col gap-4">
                        {/* Option 1: What We Offer */}
                        <button
                          onClick={() => {
                            setCurrentScreen('info');
                            setInfoSearchResponse('');
                            setInfoSearch('');
                          }}
                          className="w-full text-left p-4 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-8 h-8 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <Compass className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-[11px] uppercase tracking-wider text-near-black mb-0.5 group-hover:text-coral transition-colors">Who is SwayHouse & What we offer?</h5>
                            <p className="text-[10px] text-neutral-400 leading-normal">Explore our strategic business framework and advisory model.</p>
                          </div>
                        </button>

                        {/* Option 2: Growth Plan */}
                        <button
                          onClick={() => setCurrentScreen('audit_form')}
                          className="w-full text-left p-4 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-8 h-8 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <Sparkles className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-[11px] uppercase tracking-wider text-near-black mb-0.5 group-hover:text-coral transition-colors">Personalized Growth Plan</h5>
                            <p className="text-[10px] text-neutral-400 leading-normal">Submit your channel stats to get a custom content strategy audit.</p>
                          </div>
                        </button>

                        {/* Option 3: Draft Brand Pitch */}
                        <button
                          onClick={() => setCurrentScreen('pitch_form')}
                          className="w-full text-left p-4 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-8 h-8 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <Mail className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-[11px] uppercase tracking-wider text-near-black mb-0.5 group-hover:text-coral transition-colors">Draft a Brand Pitch</h5>
                            <p className="text-[10px] text-neutral-400 leading-normal">Generate a tailored pitch email template for premium brands.</p>
                          </div>
                        </button>

                        {/* Option 4: Book Call */}
                        <button
                          onClick={handleBookCall}
                          className="w-full text-left p-4 rounded-xl border border-near-black/5 hover:border-coral/20 hover:shadow-lg transition-all group flex items-start gap-4"
                        >
                          <div className="w-8 h-8 rounded-lg bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                            <HelpCircle className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-[11px] uppercase tracking-wider text-near-black mb-0.5 group-hover:text-coral transition-colors">Book a Free Consultation</h5>
                            <p className="text-[10px] text-neutral-400 leading-normal">First call is free. Money comes later—let&apos;s build strategy first.</p>
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
                      className="flex flex-col gap-5 text-left w-full"
                    >
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      <h4 className="font-cormorant text-2xl font-bold text-near-black">
                        What We Do
                      </h4>

                      {/* --- Ask us anything else box --- */}
                      <form onSubmit={handleInfoSearchSubmit} className="bg-soft-white border border-near-black/5 rounded-xl p-3 flex flex-col gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-coral">Ask us anything else</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              placeholder="e.g. Do you handle legal contracts?"
                              value={infoSearch}
                              onChange={(e) => setInfoSearch(e.target.value)}
                              className="w-full bg-white border border-near-black/5 rounded-lg pl-3 pr-8 py-2 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => toggleListening('info')}
                              className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
                                isListening && listeningTarget === 'info'
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : 'text-neutral-400 hover:text-near-black'
                              }`}
                            >
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="submit"
                            disabled={infoSearchLoading}
                            className="px-3 bg-near-black text-white hover:bg-neutral-800 rounded-lg transition-colors text-xs flex items-center justify-center"
                          >
                            {infoSearchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Ask'}
                          </button>
                        </div>

                        {/* Search response display */}
                        <AnimatePresence>
                          {infoSearchResponse && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 text-xs text-neutral-500 bg-white border border-near-black/5 rounded-lg p-3 max-h-[150px] overflow-y-auto no-scrollbar"
                            >
                              {renderFormattedResult(infoSearchResponse)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </form>

                      <p className="text-xs text-neutral-500 leading-relaxed mb-1">
                        SwayHouse acts as a direct business partner to creators. We handle all operational and strategic execution so talent can focus entirely on creating.
                      </p>

                      <div className="flex flex-col gap-3">
                        {[
                          { title: "Growth Architecture", desc: "Niche audits, content matrix restructuring, platform distribution strategy." },
                          { title: "Brand Deals", desc: "Sourcing campaigns, outbound pitching, building long-term brand integrations." },
                          { title: "PR & Network Building", desc: "Creator-to-creator network building, event alignments, and campaign exposure." },
                          { title: "Strategic Operations", desc: "Contracts, calendar management, legal compliance, and billing pipelines." }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-coral/5 border border-coral/10 rounded-xl">
                            <h5 className="font-bold text-xs text-near-black mb-0.5 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-coral" /> {item.title}
                            </h5>
                            <p className="text-[10px] text-neutral-400 leading-normal pl-5">{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleBookCall}
                        className="mt-2 w-full py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
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
                      className="flex flex-col gap-5 text-left w-full"
                    >
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      <h4 className="font-cormorant text-2xl font-bold text-near-black">
                        Growth Plan Audit
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Get a data-driven content matrix evaluation instantly.
                      </p>

                      <form onSubmit={handleAuditSubmit} className="flex flex-col gap-4">
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

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Post Frequency (Weekly)</label>
                          <select
                            value={auditForm.frequency}
                            onChange={(e) => setAuditForm({ ...auditForm, frequency: e.target.value })}
                            className="w-full bg-soft-white border border-near-black/5 rounded-lg px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          >
                            <option>1 time a week</option>
                            <option>A few times a week</option>
                            <option>3 to 5 times a week</option>
                            <option>Daily</option>
                            <option>Not decided yet</option>
                            <option>About to increase frequency</option>
                          </select>
                        </div>

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
                      className="flex flex-col gap-5 text-left w-full"
                    >
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      <h4 className="font-cormorant text-2xl font-bold text-near-black">
                        Draft a Brand Pitch
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Draft a direct, confident outreach email template for pitching brands.
                      </p>

                      <form onSubmit={handlePitchSubmit} className="flex flex-col gap-4">
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

                        <button
                          type="submit"
                          className="mt-2 w-full py-4 rounded-full bg-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                        >
                          Draft Brand Pitch
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* --- ACTIVE CHAT SESSION SCREEN --- */}
                  {currentScreen === 'chat_session' && (
                    <motion.div
                      key="chat_session"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-grow flex flex-col justify-between h-full min-h-[400px] w-full"
                    >
                      {/* Back button to return to menu */}
                      <button
                        onClick={() => setCurrentScreen('menu')}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start mb-4"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to menu
                      </button>

                      {/* Chat messages stream */}
                      <div className="flex-grow overflow-y-auto flex flex-col gap-4 mb-4 pr-1 max-h-[50vh] no-scrollbar">
                        {chatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex flex-col max-w-[85%] ${
                              msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                            }`}
                          >
                            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                              {msg.role === 'user' ? 'You' : 'SwayAI'}
                            </span>
                            <div
                              className={`rounded-2xl p-4 text-xs shadow-sm leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-near-black text-white rounded-tr-none'
                                  : 'bg-coral/5 border border-coral/10 text-near-black rounded-tl-none'
                              }`}
                            >
                              {msg.role === 'user' ? msg.text : renderFormattedResult(msg.text)}
                            </div>
                          </div>
                        ))}

                        {/* Loading bubble while thinking */}
                        {chatLoading && (
                          <div className="self-start flex flex-col items-start max-w-[80%]">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                              SwayAI
                            </span>
                            <div className="bg-coral/5 border border-coral/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs text-neutral-400">
                              <Loader2 className="w-3.5 h-3.5 text-coral animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          </div>
                        )}

                        <div ref={chatBottomRef} />
                      </div>

                      {/* Chat input box at the bottom */}
                      <div className="flex gap-2 border-t border-near-black/5 pt-4 bg-white sticky bottom-0">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleChatSend();
                            }}
                            className="w-full bg-soft-white border border-near-black/5 rounded-xl pl-4 pr-10 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => toggleListening('chat')}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                              isListening && listeningTarget === 'chat'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'text-neutral-400 hover:text-near-black'
                            }`}
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleChatSend()}
                          disabled={chatLoading}
                          className="p-3 bg-near-black text-white hover:bg-neutral-800 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-near-black/5 bg-soft-white text-center select-none flex flex-col gap-2 flex-shrink-0">
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
