'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, ShieldAlert, Sparkles, TrendingUp, MessageSquare, Inbox, LogOut, 
  Compass, Mail, Instagram, Check, Calendar, User, Eye, Users
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Data States
  const [dataLoading, setDataLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [pageviews, setPageviews] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics | chats | inbox
  const [activeChatSession, setActiveChatSession] = useState(null);

  // Authenticate on mount checking cookies
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const json = await res.json();
        setContacts(json.contacts);
        setChats(json.chats);
        setPageviews(json.pageviews);
        setIsAuthenticated(true);

        // Auto-select first chat session if any exist
        if (json.chats && json.chats.length > 0) {
          const sessions = getUniqueChatSessions(json.chats);
          if (sessions.length > 0) {
            setActiveChatSession(sessions[0].sessionId);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode) return;

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        const err = await res.json();
        setLoginError(err.error || 'Incorrect passcode');
      }
    } catch (err) {
      setLoginError('Server authentication failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      setIsAuthenticated(false);
      setPasscode('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Helper: Group chats by unique session ID
  const getUniqueChatSessions = (chatList) => {
    const sessionsMap = {};
    chatList.forEach(c => {
      const sessId = c.session_id;
      if (!sessionsMap[sessId]) {
        sessionsMap[sessId] = {
          sessionId: sessId,
          createdAt: c.created_at,
          messages: []
        };
      }
      sessionsMap[sessId].messages.push(c);
    });

    // Convert map to list sorted by latest message timestamp
    return Object.values(sessionsMap).sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  };

  // Helper: Get analytics metrics
  const getAnalyticsSummary = () => {
    const totalViews = pageviews.length;
    const uniqueVisitors = new Set(pageviews.map(p => p.visitor_id)).size;
    const totalConvs = new Set(chats.map(c => c.session_id)).size;
    const totalInquiries = contacts.length;

    // Top visited paths
    const pathCounts = {};
    pageviews.forEach(p => {
      pathCounts[p.path] = (pathCounts[p.path] || 0) + 1;
    });
    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top referrers
    const referrerCounts = {};
    pageviews.forEach(p => {
      const ref = p.referrer || 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalViews, uniqueVisitors, totalConvs, totalInquiries, topPaths, topReferrers };
  };

  // Render Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-soft-white px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] bg-white border border-near-black/5 rounded-2xl p-8 shadow-2xl flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center mb-6">
            <Lock className="w-5 h-5" />
          </div>

          <h2 className="font-cormorant text-3xl font-bold text-near-black mb-1">SwayHouse Terminal</h2>
          <p className="text-xs text-neutral-400 text-center mb-8">
            Access secure database and communication records.
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Security Passcode</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full bg-soft-white border border-near-black/5 rounded-xl px-4 py-3 text-center text-sm outline-none focus:ring-1 focus:ring-coral transition-all font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Authenticating...' : 'Access System'}
            </button>

            {loginError && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 text-center mt-2 flex items-center gap-2 justify-center">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> {loginError}
              </p>
            )}
          </form>
        </motion.div>
      </main>
    );
  }

  const { totalViews, uniqueVisitors, totalConvs, totalInquiries, topPaths, topReferrers } = getAnalyticsSummary();
  const chatSessions = getUniqueChatSessions(chats);
  const activeSessionMessages = chats.filter(c => c.session_id === activeChatSession);

  return (
    <main className="min-h-screen w-full bg-soft-white p-6 md:p-10 flex flex-col justify-between selection:bg-coral selection:text-white">
      <div>
        {/* HEADER BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-near-black/5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-coral/10 text-coral flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Dashboard</span>
            </div>
            <h1 className="font-cormorant text-3xl font-bold text-near-black">SwayHouse Terminal</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-red-500 transition-colors self-start md:self-center"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        {/* METRICS ROW */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Page Views', val: totalViews, icon: Eye, desc: 'Total tracked hits' },
            { label: 'Unique Visitors', val: uniqueVisitors, icon: Users, desc: 'By browser token' },
            { label: 'SwayAI Chats', val: totalConvs, icon: MessageSquare, desc: 'Logged conversations' },
            { label: 'Form Inquiries', val: totalInquiries, icon: Inbox, desc: 'Creators & Brands' }
          ].map((m, idx) => (
            <div key={idx} className="bg-white border border-near-black/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                <m.icon className="w-4 h-4 text-coral" />
              </div>
              <h3 className="font-cormorant text-3xl font-bold text-near-black mb-0.5">{m.val}</h3>
              <p className="text-[9px] text-neutral-400">{m.desc}</p>
            </div>
          ))}
        </section>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 border-b border-near-black/5 mb-6">
          {[
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'chats', label: 'SwayAI Chats', icon: MessageSquare },
            { id: 'inbox', label: 'Contact Inbox', icon: Inbox }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
                activeTab === t.id 
                  ? 'border-coral text-near-black' 
                  : 'border-transparent text-neutral-400 hover:text-near-black'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB BODY CONTENTS */}
        <div className="min-h-[500px]">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-2">
              <span className="animate-spin text-coral text-lg font-bold">●</span>
              <span className="text-xs font-semibold uppercase tracking-wider">Syncing database...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* --- ANALYTICS TAB --- */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Left Column: Top Paths & Top Referrers */}
                  <div className="flex flex-col gap-6 lg:col-span-1">
                    {/* Top Visited Pages */}
                    <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-coral" /> Top Visited Pages
                      </h4>
                      <div className="flex flex-col gap-3">
                        {topPaths.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No traffic recorded yet.</p>
                        ) : (
                          topPaths.map((tp, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-near-black/5 last:border-0">
                              <span className="font-mono text-neutral-600 font-semibold">{tp.path}</span>
                              <span className="font-bold text-near-black bg-coral/5 px-2 py-0.5 rounded text-[10px]">{tp.count} views</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Top Referring Channels */}
                    <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-coral" /> Traffic Referrers
                      </h4>
                      <div className="flex flex-col gap-3">
                        {topReferrers.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No referrers recorded.</p>
                        ) : (
                          topReferrers.map((tr, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-near-black/5 last:border-0">
                              <span className="text-neutral-500 font-semibold truncate max-w-[150px]">{tr.referrer}</span>
                              <span className="font-bold text-near-black bg-neutral-100 px-2 py-0.5 rounded text-[10px]">{tr.count} clicks</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Pageview Log */}
                  <div className="lg:col-span-2 bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4">Live Traffic Feed</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-near-black/5 text-neutral-400 uppercase text-[9px] tracking-wider">
                            <th className="pb-3">Timestamp</th>
                            <th className="pb-3">Visitor Token</th>
                            <th className="pb-3">Path</th>
                            <th className="pb-3">Referrer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageviews.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-neutral-400 italic">No logs recorded in this session.</td>
                            </tr>
                          ) : (
                            pageviews.slice(0, 40).map((pv, idx) => (
                              <tr key={idx} className="border-b border-near-black/5 last:border-0 hover:bg-neutral-50/50">
                                <td className="py-3 text-neutral-400 font-mono text-[10px]">
                                  {new Date(pv.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </td>
                                <td className="py-3 font-mono text-neutral-500 text-[10px]">
                                  {pv.visitor_id.substring(0, 16)}...
                                </td>
                                <td className="py-3 font-mono text-coral font-bold">{pv.path}</td>
                                <td className="py-3 text-neutral-500 truncate max-w-[150px]">{pv.referrer}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- CHATS LOG TAB --- */}
              {activeTab === 'chats' && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 border border-near-black/5 rounded-2xl bg-white shadow-sm overflow-hidden min-h-[550px]"
                >
                  {/* Left Column: Chat Sessions List */}
                  <div className="md:col-span-1 border-r border-near-black/5 flex flex-col h-full max-h-[550px]">
                    <div className="p-4 bg-neutral-50 border-b border-near-black/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Conversations list ({chatSessions.length})</span>
                    </div>
                    <div className="overflow-y-auto divide-y divide-near-black/5 no-scrollbar flex-grow">
                      {chatSessions.length === 0 ? (
                        <p className="p-4 text-xs text-neutral-400 italic text-center">No chat conversations recorded.</p>
                      ) : (
                        chatSessions.map((sess) => {
                          const isSelected = sess.sessionId === activeChatSession;
                          const userMsg = sess.messages.find(m => m.role === 'user')?.message || 'Greeting Interaction';
                          return (
                            <button
                              key={sess.sessionId}
                              onClick={() => setActiveChatSession(sess.sessionId)}
                              className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors flex flex-col gap-1.5 ${
                                isSelected ? 'bg-coral/5 hover:bg-coral/5' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  isSelected ? 'bg-coral text-white' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {sess.sessionId.substring(0, 12)}
                                </span>
                                <span className="text-[9px] text-neutral-400 font-mono">
                                  {new Date(sess.createdAt).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                              <p className="text-xs text-near-black font-semibold truncate w-full">
                                {userMsg}
                              </p>
                              <span className="text-[9px] text-neutral-400">
                                {sess.messages.length} exchanges
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Chat Thread Viewport */}
                  <div className="md:col-span-2 flex flex-col h-full max-h-[550px] bg-soft-white/30">
                    {activeChatSession && activeSessionMessages.length > 0 ? (
                      <>
                        {/* Chat Header Info */}
                        <div className="p-4 bg-white border-b border-near-black/5 flex items-center justify-between flex-shrink-0">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-coral">Conversation Details</span>
                            <h5 className="font-mono text-[11px] font-semibold text-neutral-500">Session ID: {activeChatSession}</h5>
                          </div>
                          <span className="text-xs text-neutral-400 font-mono">
                            Started: {new Date(activeSessionMessages[0].created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </span>
                        </div>

                        {/* Message Transcript Viewport */}
                        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
                          {activeSessionMessages.map((msg) => {
                            const isModel = msg.role === 'model';
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[85%] ${isModel ? 'self-start' : 'self-end'}`}
                              >
                                {/* Role Header badge */}
                                <span className={`text-[8px] font-bold uppercase tracking-wider mb-1 px-1 ${
                                  isModel ? 'text-coral self-start' : 'text-neutral-500 self-end'
                                }`}>
                                  {isModel ? 'SwayAI' : 'User'}
                                </span>

                                {/* Message bubble */}
                                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                                  isModel 
                                    ? 'bg-white border border-near-black/5 text-neutral-600 rounded-tl-none' 
                                    : 'bg-near-black text-white rounded-tr-none font-semibold'
                                }`}>
                                  {/* Render formatting simply for model markdown text */}
                                  <div className="whitespace-pre-line">
                                    {msg.message}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-neutral-400 py-20">
                        <MessageSquare className="w-8 h-8 text-neutral-300 mb-2" />
                        <p className="text-xs italic">Select a conversation thread on the left to review chat transcripts.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- INBOX SUBMISSIONS TAB --- */}
              {activeTab === 'inbox' && (
                <motion.div
                  key="inbox"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  {contacts.length === 0 ? (
                    <div className="bg-white border border-near-black/5 rounded-2xl p-16 text-center text-neutral-400 flex flex-col items-center justify-center">
                      <Inbox className="w-8 h-8 text-neutral-300 mb-3" />
                      <h4 className="font-cormorant text-2xl font-bold text-near-black mb-1">Your Inbox is Empty</h4>
                      <p className="text-xs text-neutral-400">No contact submissions have been logged to the database yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contacts.map((c) => (
                        <div 
                          key={c.id} 
                          className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                c.type === 'Creator'
                                  ? 'bg-coral/15 text-coral'
                                  : c.type === 'Brand'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {c.type}
                              </span>
                              <span className="text-[9px] text-neutral-400 font-mono">
                                {new Date(c.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                              </span>
                            </div>

                            {/* Name & Contact Info */}
                            <h4 className="font-cormorant text-2xl font-bold text-near-black mb-3">{c.name}</h4>

                            {/* Message box */}
                            <div className="bg-soft-white border border-near-black/5 rounded-xl p-4 mb-4 text-xs text-neutral-500 leading-relaxed italic">
                              &ldquo;{c.message}&rdquo;
                            </div>
                          </div>

                          {/* Contact Links */}
                          <div className="flex items-center gap-3 pt-3 border-t border-near-black/5">
                            <a
                              href={`mailto:${c.email}`}
                              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-coral transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" /> Email Mailbox
                            </a>
                            <a
                              href={`https://instagram.com/${c.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-coral transition-colors"
                            >
                              <Instagram className="w-3.5 h-3.5" /> @{c.instagram.replace('@', '')}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* DASHBOARD FOOTER */}
      <footer className="mt-16 pt-8 border-t border-near-black/5 text-center text-neutral-400 text-[10px]">
        SwayHouse Internal Operations Terminal &bull; Intentionally small. Exceptionally managed.
      </footer>
    </main>
  );
}
