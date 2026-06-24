'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Compass, Mail, Shield, MessageSquare, ArrowRight, Loader2, Mic, Send, HelpCircle, Check, Copy } from 'lucide-react';

export default function SwayAIModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chat'); // chat | audit | pitch
  const [sessionId, setSessionId] = useState('');
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hii! I’m SwayAI. Ask me anything about SwayHouse, creator growth, or how we manage brand deals!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Audit Form States
  const [auditForm, setAuditForm] = useState({
    handle: '',
    followers: '',
    niche: 'Lifestyle & Feel Good',
    frequency: '3 to 5 times a week',
    goal: ''
  });
  const [auditResult, setAuditResult] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  // Pitch Form States
  const [pitchForm, setPitchForm] = useState({
    handle: '',
    niche: 'Lifestyle & Feel Good',
    brand: '',
    reason: ''
  });
  const [pitchResult, setPitchResult] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);

  // Voice transcriptions
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const [copiedText, setCopiedText] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Disable scroll on open
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

  // Session ID on mount
  useEffect(() => {
    setSessionId('sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36));
  }, []);

  // Voice setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (activeTab === 'chat') {
            setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [activeTab]);

  // Scroll chat bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice transcription is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleChatSend = async (textToSend) => {
    const msg = textToSend || chatInput;
    if (!msg.trim()) return;

    const updatedHistory = [...chatHistory, { role: 'user', text: msg }];
    setChatHistory(updatedHistory);
    setChatInput('');
    setChatLoading(true);
    setErrorText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          details: { message: msg, history: chatHistory.slice(-6), sessionId }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection error');

      setChatHistory([...updatedHistory, { role: 'model', text: data.result }]);
    } catch (err) {
      setChatHistory([...updatedHistory, { role: 'model', text: `⚠️ Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!auditForm.handle || !auditForm.followers || !auditForm.goal) return;

    setAuditLoading(true);
    setAuditResult('');
    setErrorText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit', details: { ...auditForm, sessionId } })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate audit');

      setAuditResult(data.result);
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const handlePitchSubmit = async (e) => {
    e.preventDefault();
    if (!pitchForm.handle || !pitchForm.brand || !pitchForm.reason) return;

    setPitchLoading(true);
    setPitchResult('');
    setErrorText('');

    try {
      const response = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pitch', details: { ...pitchForm, sessionId } })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate brand pitch');

      setPitchResult(data.result);
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setPitchLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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

  if (!isOpen) return null;

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
          {/* Top Header */}
          <header className="sticky top-0 z-50 w-full h-20 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-near-black/5 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-inter text-sm font-extrabold tracking-tight text-near-black">
                SwayHouse
              </span>
              <span className="text-neutral-300 text-xs">|</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                SwayAI Operations Workspace
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

          {/* Main Layout Area */}
          <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 md:px-12 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Navigation Pane (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 bg-white border border-near-black/5 rounded-3xl p-6 shadow-sm justify-between">
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-coral">Core AI Engine</span>
                  <h3 className="font-cormorant text-3xl font-bold text-near-black mt-1">Operations Workspace</h3>
                </div>

                {/* Tab buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group cursor-pointer ${
                      activeTab === 'chat'
                        ? 'border-coral bg-coral/5 text-coral shadow-sm'
                        : 'border-near-black/5 hover:border-coral/20 bg-white text-neutral-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeTab === 'chat' ? 'bg-coral text-white' : 'bg-coral/5 text-coral group-hover:bg-coral group-hover:text-white'
                    }`}>
                      <MessageSquare className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className={`font-semibold text-[11px] uppercase tracking-wider mb-0.5 ${
                        activeTab === 'chat' ? 'text-coral' : 'text-near-black'
                      }`}>AI Chat Consultant</h5>
                      <p className="text-[9px] text-neutral-400 leading-normal">Direct advisory model for campaigns.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group cursor-pointer ${
                      activeTab === 'audit'
                        ? 'border-coral bg-coral/5 text-coral shadow-sm'
                        : 'border-near-black/5 hover:border-coral/20 bg-white text-neutral-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeTab === 'audit' ? 'bg-coral text-white' : 'bg-coral/5 text-coral group-hover:bg-coral group-hover:text-white'
                    }`}>
                      <Compass className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className={`font-semibold text-[11px] uppercase tracking-wider mb-0.5 ${
                        activeTab === 'audit' ? 'text-coral' : 'text-near-black'
                      }`}>Growth Plan Audit</h5>
                      <p className="text-[9px] text-neutral-400 leading-normal">Submit channel stats for niche audits.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('pitch')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group cursor-pointer ${
                      activeTab === 'pitch'
                        ? 'border-coral bg-coral/5 text-coral shadow-sm'
                        : 'border-near-black/5 hover:border-coral/20 bg-white text-neutral-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      activeTab === 'pitch' ? 'bg-coral text-white' : 'bg-coral/5 text-coral group-hover:bg-coral group-hover:text-white'
                    }`}>
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className={`font-semibold text-[11px] uppercase tracking-wider mb-0.5 ${
                        activeTab === 'pitch' ? 'text-coral' : 'text-near-black'
                      }`}>Brand Pitch Writer</h5>
                      <p className="text-[9px] text-neutral-400 leading-normal">Generate outreach letters for campaigns.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="bg-[#FBF9F6] border border-near-black/5 rounded-2xl p-4 flex gap-3 items-start select-none">
                <div className="w-7 h-7 rounded-full bg-coral/5 text-coral flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-near-black">Creator Operations</span>
                  <p className="text-[9px] text-neutral-500 leading-normal">
                    This engine analyzes niche parameters and drafts strategic content grids in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Active Interactive Tool Workstation (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-near-black/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
              <AnimatePresence mode="wait">
                
                {/* --- CHAT CONSULTANT ACTIVE TAB --- */}
                {activeTab === 'chat' && (
                  <motion.div
                    key="chat-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col justify-between h-full w-full flex-grow"
                  >
                    {/* Chat Log Stream */}
                    <div className="flex-grow overflow-y-auto flex flex-col gap-4 mb-6 pr-2 max-h-[50vh] no-scrollbar">
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

                      {chatLoading && (
                        <div className="self-start flex flex-col items-start max-w-[80%] animate-pulse">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 mb-1">SwayAI</span>
                          <div className="bg-coral/5 border border-coral/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs text-neutral-400">
                            <Loader2 className="w-3.5 h-3.5 text-coral animate-spin" />
                            <span>Formulating strategic audit advice...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Form Input */}
                    <div className="flex gap-3 border-t border-near-black/5 pt-4 bg-white">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          placeholder="Ask anything about campaign budgeting or negotiations..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleChatSend();
                          }}
                          className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl pl-4 pr-10 py-3.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                        />
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                            isListening ? 'bg-red-500 text-white animate-pulse' : 'text-neutral-400 hover:text-near-black'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleChatSend()}
                        disabled={chatLoading}
                        className="px-5 bg-near-black text-white hover:bg-neutral-800 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* --- GROWTH PLAN AUDIT ACTIVE TAB --- */}
                {activeTab === 'audit' && (
                  <motion.div
                    key="audit-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full flex-grow"
                  >
                    {/* Left: Input Form */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="font-cormorant text-xl font-bold text-near-black">Growth Plan Generator</h4>
                        <p className="text-[10px] text-neutral-400 leading-normal mt-0.5">Submit metrics to generate your advisory audit.</p>
                      </div>

                      <form onSubmit={handleAuditSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Instagram Handle</label>
                          <input
                            type="text"
                            placeholder="e.g. yourname"
                            required
                            value={auditForm.handle}
                            onChange={(e) => setAuditForm({ ...auditForm, handle: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Follower Count</label>
                          <input
                            type="text"
                            placeholder="e.g. 15,000"
                            required
                            value={auditForm.followers}
                            onChange={(e) => setAuditForm({ ...auditForm, followers: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Niche</label>
                            <select
                              value={auditForm.niche}
                              onChange={(e) => setAuditForm({ ...auditForm, niche: e.target.value })}
                              className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                            >
                              <option>Lifestyle & Feel Good</option>
                              <option>Fashion & Styling</option>
                              <option>Fitness & Wellness</option>
                              <option>Travel & Photography</option>
                              <option>Beauty & Skincare</option>
                              <option>Other / Creative</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Frequency</label>
                            <select
                              value={auditForm.frequency}
                              onChange={(e) => setAuditForm({ ...auditForm, frequency: e.target.value })}
                              className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                            >
                              <option>1 time a week</option>
                              <option>A few times a week</option>
                              <option>3 to 5 times a week</option>
                              <option>Daily</option>
                              <option>Not decided yet</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">What is your goal?</label>
                          <textarea
                            placeholder="e.g. Secure paid integrations with luxury fashion brands..."
                            required
                            rows={3}
                            value={auditForm.goal}
                            onChange={(e) => setAuditForm({ ...auditForm, goal: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none resize-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={auditLoading}
                          className="w-full py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          {auditLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate Growth Plan'}
                        </button>
                      </form>
                    </div>

                    {/* Right: Results Render */}
                    <div className="bg-[#FBF9F6] border border-near-black/5 rounded-2xl p-5 flex flex-col max-h-[420px] overflow-y-auto no-scrollbar relative shadow-inner">
                      {auditLoading ? (
                        <div className="flex flex-col items-center justify-center flex-grow py-16 gap-3">
                          <Loader2 className="w-6 h-6 text-coral animate-spin" />
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Evaluating audience parameters...</span>
                        </div>
                      ) : auditResult ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-near-black/5 pb-2 mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-coral">Plan Results</span>
                            <button
                              onClick={() => copyToClipboard(auditResult)}
                              className="text-neutral-400 hover:text-coral flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider outline-none"
                            >
                              {copiedText ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedText ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="text-xs text-neutral-600 leading-relaxed font-mono">
                            {renderFormattedResult(auditResult)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-grow py-16 text-center text-neutral-400 select-none">
                          <Compass className="w-8 h-8 text-neutral-300 mb-2" />
                          <span className="font-cormorant text-base font-bold text-near-black">No plan generated</span>
                          <p className="text-[10px] max-w-[200px] mt-1 leading-normal">Submit your channel stats to display your personalized content roadmap here.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* --- BRAND PITCH ACTIVE TAB --- */}
                {activeTab === 'pitch' && (
                  <motion.div
                    key="pitch-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full flex-grow"
                  >
                    {/* Left: Input Form */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="font-cormorant text-xl font-bold text-near-black">Outbound Pitch Writer</h4>
                        <p className="text-[10px] text-neutral-400 leading-normal mt-0.5">Generate tailored brand collaboration templates.</p>
                      </div>

                      <form onSubmit={handlePitchSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Instagram Handle</label>
                          <input
                            type="text"
                            placeholder="e.g. yourname"
                            required
                            value={pitchForm.handle}
                            onChange={(e) => setPitchForm({ ...pitchForm, handle: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Niche Category</label>
                          <select
                            value={pitchForm.niche}
                            onChange={(e) => setPitchForm({ ...pitchForm, niche: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          >
                            <option>Lifestyle & Feel Good</option>
                            <option>Fashion & Styling</option>
                            <option>Fitness & Wellness</option>
                            <option>Travel & Photography</option>
                            <option>Beauty & Skincare</option>
                            <option>Other / Creative</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Target Brand</label>
                          <input
                            type="text"
                            placeholder="e.g. Zara or Gymshark"
                            required
                            value={pitchForm.brand}
                            onChange={(e) => setPitchForm({ ...pitchForm, brand: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Why fits this brand?</label>
                          <textarea
                            placeholder="e.g. I wear their products in all lookbooks and my audience loves them..."
                            required
                            rows={3}
                            value={pitchForm.reason}
                            onChange={(e) => setPitchForm({ ...pitchForm, reason: e.target.value })}
                            className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none resize-none focus:ring-1 focus:ring-coral transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={pitchLoading}
                          className="w-full py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          {pitchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Draft Outreach Pitch'}
                        </button>
                      </form>
                    </div>

                    {/* Right: Results Render */}
                    <div className="bg-[#FBF9F6] border border-near-black/5 rounded-2xl p-5 flex flex-col max-h-[420px] overflow-y-auto no-scrollbar relative shadow-inner">
                      {pitchLoading ? (
                        <div className="flex flex-col items-center justify-center flex-grow py-16 gap-3">
                          <Loader2 className="w-6 h-6 text-coral animate-spin" />
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Drafting collaboration email...</span>
                        </div>
                      ) : pitchResult ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b border-near-black/5 pb-2 mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-coral">Outreach Template</span>
                            <button
                              onClick={() => copyToClipboard(pitchResult)}
                              className="text-neutral-400 hover:text-coral flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider outline-none"
                            >
                              {copiedText ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedText ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="text-xs text-neutral-600 leading-relaxed font-mono whitespace-pre-wrap">
                            {pitchResult}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-grow py-16 text-center text-neutral-400 select-none">
                          <Mail className="w-8 h-8 text-neutral-300 mb-2" />
                          <span className="font-cormorant text-base font-bold text-near-black">No email drafted</span>
                          <p className="text-[10px] max-w-[200px] mt-1 leading-normal">Submit outreach details to review your customized pitch template here.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
