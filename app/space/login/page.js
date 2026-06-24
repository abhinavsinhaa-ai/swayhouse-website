'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SpaceLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Forgot password flow states
  const [resetUsername, setResetUsername] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Username, 2: OTP + New Password
  const [testOtp, setTestOtp] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/space/profile');
        if (res.ok) {
          router.push('/space/portal');
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/space/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/space/portal');
      } else {
        setError(data.error || 'Incorrect username or password');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSignupSuccess('');

    if (!name.trim() || !username.trim() || !password) {
      setError('Name, Username, and Password are required');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('At least one contact method (Email or Phone) is required');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) {
      setError('Invalid Username. Only letters, numbers, hyphens, and underscores are allowed.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/space/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSignupSuccess('Account created successfully! Entering Studio...');
        setTimeout(() => {
          router.push('/space/portal');
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetUsername.trim()) return;

    setLoading(true);
    setError('');
    setResetStatus('');
    setTestOtp('');

    try {
      const res = await fetch('/api/space/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', username: resetUsername }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetStatus(`OTP code sent to your registered email (${data.email})!`);
        if (data.otp) {
          setTestOtp(data.otp);
        }
        setStep(2);
      } else {
        setError(data.error || 'Failed to request OTP');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUsername.trim() || !resetOtp.trim() || !newPassword) return;

    setLoading(true);
    setError('');
    setResetStatus('');

    try {
      const res = await fetch('/api/space/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          username: resetUsername,
          otp: resetOtp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSignupSuccess('Password reset successfully! Redirecting...');
        setTimeout(() => {
          setIsForgotPassword(false);
          setStep(1);
          setIsLogin(true);
          setSignupSuccess('');
          setResetUsername('');
          setResetOtp('');
          setNewPassword('');
          setTestOtp('');
        }, 2000);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#FBF9F6] py-12 px-6 relative selection:bg-coral selection:text-white">
      {/* Subtle Noise overlay */}
      <div className="noise-bg opacity-[0.02] pointer-events-none fixed inset-0 z-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-white border border-near-black/5 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center relative z-10"
      >
        {/* Brand Link Logo */}
        <Link href="/" className="flex items-center gap-2 logo-element group mb-6">
          <svg className="w-6 h-5.5 text-coral" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 32 V19 L20 11 L28 19 V32 H12 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
            <path d="M3 24 C 13 13, 27 33, 37 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
          <span className="font-inter text-xs font-extrabold tracking-tight text-near-black">SwayHouse</span>
        </Link>

        <div className="w-10 h-10 rounded-full bg-coral/10 text-coral flex items-center justify-center mb-4">
          <Lock className="w-4.5 h-4.5" />
        </div>

        <h2 className="font-cormorant text-2xl font-bold text-near-black text-center mb-1">
          {isForgotPassword ? 'Reset Password' : 'Sway Space Portal'}
        </h2>
        <p className="text-[11px] text-neutral-400 text-center mb-6 uppercase tracking-widest font-semibold">
          {isForgotPassword ? 'Password Recovery' : 'Manage your personal bio-grid'}
        </p>

        {isForgotPassword ? (
          /* Forgot Password Flow */
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setStep(1);
                setError('');
                setResetStatus('');
                setTestOtp('');
              }}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
            </button>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="forgot-step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleRequestOtp}
                  className="w-full flex flex-col gap-4 mt-2"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Your Space Username</label>
                    <input
                      type="text"
                      placeholder="e.g. sarahj"
                      required
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                  >
                    {loading ? 'Sending...' : 'Send Reset OTP'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="forgot-step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleResetPassword}
                  className="w-full flex flex-col gap-4 mt-2"
                >
                  {resetStatus && (
                    <span className="text-[10px] text-green-700 bg-green-50 border border-green-100 rounded-lg p-2.5 leading-normal block">
                      {resetStatus}
                    </span>
                  )}
                  {testOtp && (
                    <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-lg p-2.5 text-[10px] flex flex-col gap-1">
                      <span className="font-bold uppercase tracking-wider">🔑 Testing Assistant:</span>
                      <p>Use OTP code <strong className="font-mono text-xs">{testOtp}</strong> to verify immediately.</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Enter OTP Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 123456"
                      required
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono tracking-widest text-center text-sm font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                  >
                    {loading ? 'Resetting...' : 'Update Password'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Normal Auth Forms (Login / Sign Up) */
          <>
            {/* Tab Switcher */}
            <div className="flex w-full border-b border-near-black/5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setSignupSuccess('');
                }}
                className="flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer outline-none font-inter"
                style={{
                  borderBottom: isLogin ? '2px solid #FF6B35' : 'none',
                  color: isLogin ? '#1A1A1A' : '#A3A3A3'
                }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setSignupSuccess('');
                }}
                className="flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer outline-none font-inter"
                style={{
                  borderBottom: !isLogin ? '2px solid #FF6B35' : 'none',
                  color: !isLogin ? '#1A1A1A' : '#A3A3A3'
                }}
              >
                Create Space
              </button>
            </div>

            {/* Auth Forms */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Space Username</label>
                    <input
                      type="text"
                      placeholder="e.g. sarahj"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono"
                    />
                  </div>

                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setStep(1);
                        setError('');
                        setResetStatus('');
                        setTestOtp('');
                      }}
                      className="text-[10px] font-bold text-coral hover:underline cursor-pointer outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {loading ? 'Entering...' : 'Access Space'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Choose Username</label>
                    <input
                      type="text"
                      placeholder="e.g. sarahj"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. sarah@google.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                    <span className="text-[8.5px] text-neutral-400 italic">One contact info (email or phone) is mandatory</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {loading ? 'Creating...' : 'Create Your Space'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Status Messages */}
        {error && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 w-full text-center mt-4 flex items-center gap-2 justify-center"
          >
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </motion.p>
        )}

        {signupSuccess && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[11px] text-green-600 bg-green-50 border border-green-100 rounded-lg p-2.5 w-full text-center mt-4 flex items-center gap-2 justify-center font-semibold"
          >
            <Check className="w-3.5 h-3.5 flex-shrink-0" /> {signupSuccess}
          </motion.p>
        )}

        {/* E2E Security notice card */}
        <div className="w-full mt-6 bg-[#FBF9F6] border border-near-black/5 rounded-xl p-4 flex gap-3 items-start select-none">
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">E2E Chat Encryption Active</span>
            <p className="text-[9px] text-neutral-500 leading-normal">
              All communications and visual chats with SwayAI are secured using certified end-to-end encryption. No personal chat records or visual files are shared with third parties or stored in unencrypted formats.
            </p>
          </div>
        </div>

        <span className="text-[9px] text-neutral-400 uppercase tracking-widest mt-8">
          Create. share. connect.
        </span>
      </motion.div>
    </main>
  );
}
