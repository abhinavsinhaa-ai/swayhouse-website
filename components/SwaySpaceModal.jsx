'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, Check, ArrowLeft, X, Layout, Shield, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';

export default function SwaySpaceModal({ isOpen, onClose }) {
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
  const [resetStatus, setResetStatus] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
        onClose();
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
          onClose();
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

    try {
      const res = await fetch('/api/space/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', username: resetUsername }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetStatus(`OTP code sent to your registered email (${data.email})!`);
        setStep(2);
        setIsOtpVerified(false);
      } else {
        setError(data.error || 'Failed to request OTP');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!resetUsername.trim() || !resetOtp.trim()) return;

    setOtpVerifying(true);
    setError('');
    setResetStatus('');

    try {
      const res = await fetch('/api/space/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          username: resetUsername,
          otp: resetOtp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsOtpVerified(true);
        setResetStatus('OTP code verified successfully! You can now enter your new password.');
      } else {
        setError(data.error || 'Invalid or expired OTP code');
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isOtpVerified) {
      handleVerifyOtp(e);
      return;
    }
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
          setIsOtpVerified(false);
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
          {/* Top Bar Header */}
          <header className="sticky top-0 z-50 w-full h-20 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-near-black/5 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-inter text-sm font-extrabold tracking-tight text-near-black">
                SwayHouse
              </span>
              <span className="text-neutral-300 text-xs">|</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                SwaySpace Portal
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

          {/* Main Space Layout Content */}
          <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-stretch">
            
            {/* Left Side: Editorial Banner / Mock visual grid */}
            <div className="lg:col-span-5 bg-gradient-to-br from-near-black to-[#2A2A2A] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-white/5 flex flex-col justify-between min-h-[450px]">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-coral/20 rounded-full blur-[90px] -mr-24 -mt-24 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[70px] -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6">
                <span className="text-[9px] font-bold uppercase tracking-widest text-coral bg-coral/10 border border-coral/20 px-3 py-1 rounded-full self-start">
                  Ecosystem Active
                </span>
                <h2 className="font-cormorant text-5xl md:text-6xl font-light leading-[1.1] tracking-tight">
                  Your own space grid.
                </h2>
                <p className="text-sm text-neutral-300 leading-relaxed max-w-sm">
                  Create your personal space, capture your moments, and showcase. Yesterday anyone could dream—today anyone can create.
                </p>
              </div>

              {/* Mini visual mockup grid inside the left sidebar */}
              <div className="relative z-10 grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg mt-8 select-none">
                <div className="aspect-square bg-white/10 rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-bold text-coral/80 uppercase">Aesthetic</div>
                <div className="aspect-square bg-white/10 rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-bold text-coral/80 uppercase">Moments</div>
                <div className="aspect-square bg-white/10 rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-bold text-coral/80 uppercase">Links</div>
                <div className="col-span-3 h-[1px] bg-white/10 my-1" />
                <div className="col-span-2 text-[9px] text-neutral-400">swayhouse.in/space/username</div>
                <div className="text-right text-[9px] text-coral font-bold uppercase">Live</div>
              </div>
            </div>

            {/* Right Side: Auth Core */}
            <div className="lg:col-span-7 flex flex-col justify-center bg-white border border-near-black/5 rounded-3xl p-6 md:p-10 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-coral/10 text-coral flex items-center justify-center mb-6">
                <Lock className="w-4.5 h-4.5" />
              </div>

              <h2 className="font-cormorant text-3xl font-bold text-near-black mb-1">
                {isForgotPassword ? 'Reset Password' : 'Sway Space Portal'}
              </h2>
              <p className="text-[10px] text-neutral-400 mb-8 uppercase tracking-widest font-semibold">
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
                      setIsOtpVerified(false);
                    }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors self-start outline-none cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
                  </button>

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.form
                        key="modal-forgot-1"
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
                            placeholder="e.g. aanyagarg"
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
                        key="modal-forgot-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onSubmit={isOtpVerified ? handleResetPassword : handleVerifyOtp}
                        className="w-full flex flex-col gap-4 mt-2"
                      >
                        {resetStatus && (
                          <span className="text-[10px] text-green-700 bg-green-50 border border-green-100 rounded-lg p-2.5 leading-normal block text-center font-medium">
                            {resetStatus}
                          </span>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Enter OTP Code</label>
                          <input
                            type="text"
                            placeholder="e.g. 123456"
                            required
                            maxLength={6}
                            disabled={isOtpVerified}
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            className={`w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono tracking-widest text-center text-sm font-bold ${
                              isOtpVerified ? 'opacity-60 cursor-not-allowed bg-green-50/10 border-green-100 text-green-700' : ''
                            }`}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 relative">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                            <span>New Password</span>
                            {!isOtpVerified && (
                              <span className="text-[8px] text-coral font-bold bg-coral/5 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Locked
                              </span>
                            )}
                          </label>
                          <div className="relative w-full">
                            <input
                              type="password"
                              placeholder={isOtpVerified ? "••••••••" : "Verify OTP to unlock"}
                              required
                              disabled={!isOtpVerified}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className={`w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl pl-4 pr-10 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-mono ${
                                !isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                              {isOtpVerified ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || otpVerifying}
                          className="w-full py-3.5 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                        >
                          {otpVerifying 
                            ? 'Verifying...' 
                            : loading 
                              ? 'Updating...' 
                              : isOtpVerified 
                                ? 'Update Password' 
                                : 'Verify OTP'}
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
                        key="modal-login-form"
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
                            placeholder="e.g. aanyagarg"
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
                              setIsOtpVerified(false);
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
                        key="modal-signup-form"
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
                            placeholder="e.g. Aanya Garg"
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
                            placeholder="e.g. aanyagarg"
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

              {/* E2E Security Notice */}
              <div className="w-full mt-8 bg-[#FBF9F6] border border-near-black/5 rounded-2xl p-4 flex gap-3 items-start select-none">
                <div className="w-7 h-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-green-700">Encrypted Space Security</span>
                  <p className="text-[9px] text-neutral-500 leading-normal">
                    Grid records, messages, and login data are fully encrypted end-to-end.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
