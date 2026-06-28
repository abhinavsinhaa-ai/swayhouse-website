'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, ShieldAlert, Sparkles, TrendingUp, MessageSquare, Inbox, LogOut, 
  Compass, Mail, Instagram, Check, Calendar, User, Eye, EyeOff, Users
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  // Dashboard Data States
  const [dataLoading, setDataLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [pageviews, setPageviews] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics | creators | chats | inbox
  const [dbCreators, setDbCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [newCreator, setNewCreator] = useState({ id: '', name: '', password: '', isSpace: false });
  const [creatorsError, setCreatorsError] = useState('');
  const [creatorsSuccess, setCreatorsSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [activeChatSession, setActiveChatSession] = useState(null);

  // Authenticate on mount checking cookies
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`/api/admin/data?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setContacts(json.contacts);
        setChats(json.chats);
        setPageviews(json.pageviews);
        setIsAuthenticated(true);
        await fetchCreators();

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

  const fetchCreators = async () => {
    try {
      const res = await fetch('/api/admin/creators');
      if (res.ok) {
        const json = await res.json();
        setDbCreators(json.creators || []);
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
    }
  };

  const handleAddCreator = async (e) => {
    e.preventDefault();
    if (!newCreator.id || !newCreator.name || !newCreator.password) return;

    setCreatorsLoading(true);
    setCreatorsError('');
    setCreatorsSuccess('');

    try {
      const res = await fetch('/api/admin/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCreator.id,
          name: newCreator.name,
          password: newCreator.password,
          isSpace: newCreator.isSpace
        })
      });

      const data = await res.json();

      if (res.ok) {
        setCreatorsSuccess(`${newCreator.isSpace ? 'Sway Space' : 'Creator'} @${newCreator.id} added successfully!`);
        setNewCreator({ id: '', name: '', password: '', isSpace: false });
        await fetchCreators();
      } else {
        setCreatorsError(data.error || 'Failed to add creator');
      }
    } catch (err) {
      setCreatorsError('Connection to server failed');
    } finally {
      setCreatorsLoading(false);
    }
  };

  const handleDeleteCreator = async (creatorId, isSpace) => {
    if (!confirm(`Are you sure you want to delete the ${isSpace ? 'space' : 'creator'} "${creatorId}"? This will permanently delete their profile from the database.`)) {
      return;
    }

    setDeletingId(creatorId);
    setCreatorsError('');
    setCreatorsSuccess('');

    try {
      const res = await fetch(`/api/admin/creators?id=${creatorId}&is_space=${isSpace ? 'true' : 'false'}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setCreatorsSuccess(`${isSpace ? 'Space' : 'Creator'} @${creatorId} deleted successfully.`);
        await fetchCreators();
      } else {
        const data = await res.json();
        setCreatorsError(data.error || `Failed to delete ${isSpace ? 'space' : 'creator'}`);
      }
    } catch (err) {
      setCreatorsError('Connection failed');
    } finally {
      setDeletingId(null);
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
      if (!sessId) return;
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
    const totalConvs = new Set(chats.map(c => c.session_id).filter(Boolean)).size;
    const totalInquiries = contacts.length;
    const avgViewsPerVisitor = uniqueVisitors > 0 ? (totalViews / uniqueVisitors).toFixed(1) : '0';

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

    // Top countries
    const countryCounts = {};
    pageviews.forEach(p => {
      const country = p.country || 'Local/Development';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top cities
    const cityCounts = {};
    pageviews.forEach(p => {
      const city = p.city || 'Unknown';
      if (city !== 'Unknown') {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });
    const topCities = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device breakdown
    const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    pageviews.forEach(p => {
      const dev = p.device_type || 'Desktop';
      if (deviceCounts[dev] !== undefined) {
        deviceCounts[dev] = deviceCounts[dev] + 1;
      }
    });

    // OS breakdown
    const osCounts = {};
    pageviews.forEach(p => {
      const osName = p.os || 'Unknown';
      osCounts[osName] = (osCounts[osName] || 0) + 1;
    });
    const topOS = Object.entries(osCounts)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { 
      totalViews, 
      uniqueVisitors, 
      totalConvs, 
      totalInquiries, 
      avgViewsPerVisitor,
      topPaths, 
      topReferrers,
      topCountries,
      topCities,
      deviceCounts,
      topOS
    };
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
              <div className="relative w-full">
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  autoFocus
                  className={`w-full bg-soft-white border border-near-black/5 rounded-xl pl-4 pr-11 py-3 text-center text-sm outline-none focus:ring-1 focus:ring-coral transition-all ${
                    showPasscode ? 'font-sans tracking-normal' : 'font-mono tracking-widest'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-near-black transition-colors focus:outline-none cursor-pointer"
                >
                  {showPasscode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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

  const { 
    totalViews, 
    uniqueVisitors, 
    totalConvs, 
    totalInquiries, 
    avgViewsPerVisitor,
    topPaths, 
    topReferrers,
    topCountries,
    topCities,
    deviceCounts,
    topOS
  } = getAnalyticsSummary();
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
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Page Views', val: totalViews, icon: Eye, desc: 'Total tracked hits' },
            { label: 'Unique Visitors', val: uniqueVisitors, icon: Users, desc: 'By browser token' },
            { label: 'Visitor Depth', val: `${avgViewsPerVisitor} pgs`, icon: TrendingUp, desc: 'Avg views per visitor' },
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
            { id: 'creators', label: 'Manage Creators', icon: Users },
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
              {activeTab === 'analytics' && (() => {
                const totalDeviceViews = (deviceCounts.Desktop || 0) + (deviceCounts.Mobile || 0) + (deviceCounts.Tablet || 0) || 1;
                const desktopPercent = Math.round(((deviceCounts.Desktop || 0) / totalDeviceViews) * 100);
                const mobilePercent = Math.round(((deviceCounts.Mobile || 0) / totalDeviceViews) * 100);
                const tabletPercent = Math.round(((deviceCounts.Tablet || 0) / totalDeviceViews) * 100);

                return (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-8"
                  >
                    {/* TOP ANALYTICS BOXES GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Box 1: Pages & Referrers */}
                      <div className="flex flex-col gap-6">
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

                      {/* Box 2: Geographic Locations */}
                      <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-coral" /> Geographic (Countries)
                          </h4>
                          <div className="flex flex-col gap-3">
                            {topCountries.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No country data recorded.</p>
                            ) : (
                              topCountries.map((tc, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-near-black/5 last:border-0">
                                  <span className="text-neutral-600 font-semibold">{tc.country}</span>
                                  <span className="font-bold text-near-black bg-coral/5 px-2 py-0.5 rounded text-[10px]">{tc.count} views</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-coral" /> Top Cities
                          </h4>
                          <div className="flex flex-col gap-3">
                            {topCities.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No city data recorded.</p>
                            ) : (
                              topCities.map((tci, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-near-black/5 last:border-0">
                                  <span className="text-neutral-500 font-semibold">{tci.city}</span>
                                  <span className="font-bold text-near-black bg-neutral-100 px-2 py-0.5 rounded text-[10px]">{tci.count} views</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Box 3: Device & OS Breakdown */}
                      <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-coral" /> Devices
                          </h4>
                          <div className="flex flex-col gap-4">
                            {[
                              { name: 'Desktop', pct: desktopPercent, val: deviceCounts.Desktop },
                              { name: 'Mobile', pct: mobilePercent, val: deviceCounts.Mobile },
                              { name: 'Tablet', pct: tabletPercent, val: deviceCounts.Tablet }
                            ].map((dev, idx) => (
                              <div key={idx} className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs font-semibold text-neutral-600">
                                  <span>{dev.name}</span>
                                  <span>{dev.pct}% ({dev.val || 0})</span>
                                </div>
                                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-coral transition-all duration-500" 
                                    style={{ width: `${dev.pct}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-coral" /> Operating Systems
                          </h4>
                          <div className="flex flex-col gap-3">
                            {topOS.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No OS data recorded.</p>
                            ) : (
                              topOS.map((osItem, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-near-black/5 last:border-0">
                                  <span className="text-neutral-500 font-semibold">{osItem.os}</span>
                                  <span className="font-bold text-near-black bg-neutral-100 px-2 py-0.5 rounded text-[10px]">{osItem.count} views</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE TRAFFIC LOG LOGS TABLE */}
                    <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4">Live Traffic Feed</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-near-black/5 text-neutral-400 uppercase text-[9px] tracking-wider">
                              <th className="pb-3">Timestamp</th>
                              <th className="pb-3">Visitor Token</th>
                              <th className="pb-3">Path</th>
                              <th className="pb-3">Location</th>
                              <th className="pb-3">Device/OS</th>
                              <th className="pb-3">Referrer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageviews.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-neutral-400 italic">No logs recorded in this session.</td>
                              </tr>
                            ) : (
                              pageviews.slice(0, 40).map((pv, idx) => (
                                <tr key={idx} className="border-b border-near-black/5 last:border-0 hover:bg-neutral-50/50">
                                  <td className="py-3 text-neutral-400 font-mono text-[10px]">
                                    {new Date(pv.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                  </td>
                                  <td className="py-3 font-mono text-neutral-500 text-[10px]">
                                    {pv.visitor_id.substring(0, 12)}...
                                  </td>
                                  <td className="py-3 font-mono text-coral font-bold">{pv.path}</td>
                                  <td className="py-3 text-neutral-600 font-medium">
                                    {pv.city && pv.city !== 'Unknown' ? `${pv.city}, ` : ''}{pv.country || 'Local/Development'}
                                  </td>
                                  <td className="py-3">
                                    <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[10px] mr-1.5 font-semibold">
                                      {pv.device_type || 'Desktop'}
                                    </span>
                                    <span className="text-neutral-400 font-mono text-[10px]">
                                      {pv.os || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-neutral-500 truncate max-w-[150px]">{pv.referrer}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

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
                                  {(sess.sessionId || '').substring(0, 12)}
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

              {/* --- CREATORS TAB --- */}
              {activeTab === 'creators' && (
                <motion.div
                  key="creators"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in"
                >
                  {/* Left Panel: Add New Creator Form */}
                  <div className="lg:col-span-5 bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                    <div>
                      <h4 className="font-cormorant text-2xl font-bold text-near-black mb-1">Add New Creator</h4>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Generate credentials and profile</p>
                    </div>

                    <form onSubmit={handleAddCreator} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Username / Creator ID</label>
                        <input
                          type="text"
                          placeholder="e.g. aditi (lowercase, no spaces)"
                          required
                          value={newCreator.id}
                          onChange={(e) => setNewCreator({ ...newCreator, id: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                          className="w-full bg-soft-white border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Aditi Chandan"
                          required
                          value={newCreator.name}
                          onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                          className="w-full bg-soft-white border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Temp Password</label>
                        <input
                          type="text"
                          placeholder="e.g. create123"
                          required
                          value={newCreator.password}
                          onChange={(e) => setNewCreator({ ...newCreator, password: e.target.value })}
                          className="w-full bg-soft-white border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 mb-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Account Type</label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-2 text-xs text-neutral-500 font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="isSpace"
                              checked={!newCreator.isSpace}
                              onChange={() => setNewCreator({ ...newCreator, isSpace: false })}
                              className="accent-coral"
                            />
                            Roster Creator
                          </label>
                          <label className="flex items-center gap-2 text-xs text-neutral-500 font-semibold cursor-pointer">
                            <input
                              type="radio"
                              name="isSpace"
                              checked={newCreator.isSpace}
                              onChange={() => setNewCreator({ ...newCreator, isSpace: true })}
                              className="accent-coral"
                            />
                            Sway Space (Grid Only)
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={creatorsLoading}
                        className="w-full mt-2 py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        {creatorsLoading ? 'Creating...' : 'Create Creator Account'}
                      </button>

                      {creatorsError && (
                        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 text-center mt-2 flex items-center gap-2 justify-center">
                          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> {creatorsError}
                        </p>
                      )}

                      {creatorsSuccess && (
                        <p className="text-[11px] text-green-600 bg-green-50 border border-green-100 rounded-lg p-2.5 text-center mt-2 flex items-center gap-2 justify-center">
                          <Check className="w-3.5 h-3.5 flex-shrink-0" /> {creatorsSuccess}
                        </p>
                      )}
                    </form>
                  </div>

                  {/* Right Panel: Current Roster List */}
                  <div className="lg:col-span-7 bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-near-black mb-4">Signed Creator Accounts</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-near-black/5 text-neutral-400 uppercase text-[9px] tracking-wider">
                            <th className="pb-3">Creator Name</th>
                            <th className="pb-3">Username / ID</th>
                            <th className="pb-3">Niche / Type</th>
                            <th className="pb-3">Contact Details</th>
                            <th className="pb-3">Registered On</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbCreators.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-neutral-400 italic">No creators registered in Supabase yet.</td>
                            </tr>
                          ) : (
                            dbCreators.map((c) => (
                              <tr key={c.id} className="border-b border-near-black/5 last:border-0 hover:bg-neutral-50/50">
                                <td className="py-4 font-semibold text-near-black">
                                  {c.name}
                                </td>
                                <td className="py-4 font-mono text-neutral-500">
                                  @{c.id}
                                </td>
                                <td className="py-4">
                                  <div className="flex flex-col gap-1 items-start">
                                    <span className="bg-coral/10 text-coral px-2.5 py-0.5 rounded text-[10px] font-semibold">
                                      {c.niche || 'Lifestyle & Feel Good'}
                                    </span>
                                    {c.is_space && (
                                      <span className="bg-neutral-100 text-neutral-500 border border-near-black/5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                                        Sway Space
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4">
                                  {c.is_space ? (
                                    <div className="flex flex-col gap-0.5 text-neutral-600">
                                      {c.email && <span className="truncate max-w-[150px] inline-block" title={c.email}>{c.email}</span>}
                                      {c.phone && <span className="font-mono text-[10px]">{c.phone}</span>}
                                      {c.otp && (
                                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded px-1.5 py-0.5 text-[9px] font-bold mt-1 max-w-max select-all" title="Click to copy OTP">
                                          🔑 OTP: {c.otp}
                                        </span>
                                      )}
                                      {!c.email && !c.phone && <span className="text-neutral-400 italic text-[10px]">No contact info</span>}
                                    </div>
                                  ) : (
                                    <span className="text-neutral-400 italic text-[10px]">Manual Account</span>
                                  )}
                                </td>
                                <td className="py-4 text-neutral-500 text-[10px]">
                                  {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => handleDeleteCreator(c.id, c.is_space)}
                                    disabled={deletingId === c.id}
                                    className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer"
                                  >
                                    {deletingId === c.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
