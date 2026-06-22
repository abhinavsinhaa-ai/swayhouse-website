'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Instagram, MapPin, Tag, 
  Trash2, Upload, LogOut, ExternalLink, Check, Loader2, Sparkles, AlertCircle, Copy 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function SpacePortal() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Editable Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [niche, setNiche] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/space/profile');
      if (res.ok) {
        const json = await res.json();
        const p = json.profile;
        setProfile(p);
        setName(p.name || '');
        setAge(p.age || '');
        setLocation(p.location || '');
        setInstagram(p.instagram || '');
        setNiche(p.niche || '');
        setBio(p.bio || '');
        setMessage(p.message || '');
        setImages(p.images || []);
      } else {
        // Not authenticated, redirect to login
        router.push('/space/login');
      }
    } catch (err) {
      console.error('Error fetching space profile:', err);
      setErrorMsg('Failed to sync profile data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/space/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          location,
          instagram,
          niche,
          bio,
          message,
          images
        })
      });

      if (res.ok) {
        setSuccessMsg('Portfolio updated successfully! Changes are live.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save changes.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/space/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      router.push('/space/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleImageDelete = (indexToDelete) => {
    setImages(images.filter((_, idx) => idx !== indexToDelete));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      if (!supabase || !supabase.storage) {
        console.warn('[STORAGE MOCK] Supabase is not configured. Simulating image upload.');
        const mockRandomId = Math.floor(Math.random() * 1000);
        const simulatedUrl = `https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80&sig=${mockRandomId}`;
        setImages([...images, simulatedUrl]);
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `spaces/${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('creator-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-assets')
        .getPublicUrl(fileName);

      setImages([...images, publicUrl]);
    } catch (err) {
      console.error('Upload failed error:', err);
      setErrorMsg(`Image upload failed: ${err.message || 'Make sure the "creator-assets" storage bucket is created and set to public.'}`);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploadingProfile(true);
    setErrorMsg('');

    try {
      if (!supabase || !supabase.storage) {
        console.warn('[STORAGE MOCK] Supabase is not configured. Simulating profile pic upload.');
        const mockRandomId = Math.floor(Math.random() * 1000);
        const simulatedUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80&sig=${mockRandomId}`;
        const newImages = [...images];
        if (newImages.length > 0) {
          newImages[0] = simulatedUrl;
        } else {
          newImages.push(simulatedUrl);
        }
        setImages(newImages);
        setUploadingProfile(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `spaces/${profile.id}/profile-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('creator-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-assets')
        .getPublicUrl(fileName);

      const newImages = [...images];
      if (newImages.length > 0) {
        newImages[0] = publicUrl;
      } else {
        newImages.push(publicUrl);
      }
      setImages(newImages);
    } catch (err) {
      console.error('Profile pic upload failed:', err);
      setErrorMsg(`Profile image upload failed: ${err.message || 'Check storage configuration.'}`);
    } finally {
      setUploadingProfile(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleProfilePicRemove = () => {
    const newImages = [...images];
    newImages.shift();
    setImages(newImages);
  };

  const handleMakeCover = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  const getPublicUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/space/${profile?.id}`;
    }
    return `/space/${profile?.id}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center text-neutral-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading Space Studio...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBF9F6] text-near-black font-inter selection:bg-coral selection:text-white relative overflow-x-hidden antialiased">
      <div className="noise-bg opacity-[0.02] pointer-events-none fixed inset-0 z-50"></div>

      {/* ===== PORTAL HEADER ===== */}
      <header className="w-full h-20 border-b border-near-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-40 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-coral/10 text-coral flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-cormorant text-xl font-bold text-near-black leading-none">Space Studio</h1>
              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Curate your personal Grid</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href={`/space/${profile?.id}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-coral transition-colors"
            >
              <span>View Space</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== PORTAL CONTENT ===== */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        
        {/* ===== PROMINENT BIOLINK SHARE CARD ===== */}
        <div className="bg-coral rounded-2xl p-6 md:p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded">Bio Link Sharer</span>
            <h3 className="font-cormorant text-2xl md:text-3xl font-semibold mt-3 mb-1">Your Space is live!</h3>
            <p className="text-xs opacity-90">Copy this link and add it to your Instagram or social bio to showcase your grid.</p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 bg-white/10 rounded-xl p-2 border border-white/10 max-w-md">
            <span className="text-xs font-mono truncate px-2 select-all w-full">{getPublicUrl()}</span>
            <button 
              onClick={copyLink}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white text-coral rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts Banner */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-xs text-green-700"
            >
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-xs text-red-700"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION: Profile info inputs (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Base Profile Card */}
            <div className="bg-white border border-near-black/5 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <h3 className="font-cormorant text-2xl font-bold text-near-black border-b border-near-black/5 pb-3">
                Space Identity
              </h3>

              {/* Profile Picture Edit Widget */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-near-black/5">
                <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-near-black/5 bg-coral/5 flex-shrink-0 flex items-center justify-center shadow-sm">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={images[0]} 
                      alt="Profile Photo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-coral/40" />
                  )}
                  {uploadingProfile && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                  <h4 className="font-semibold text-xs text-near-black">Profile Avatar</h4>
                  <p className="text-[10px] text-neutral-400">This photo represents your primary profile image.</p>
                  
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <input
                      type="file"
                      accept="image/*"
                      ref={profileInputRef}
                      onChange={handleProfilePicUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingProfile || uploading}
                      onClick={() => profileInputRef.current?.click()}
                      className="px-3.5 py-1.5 border border-near-black/10 hover:border-coral/30 rounded-lg text-[9px] uppercase font-bold tracking-wider hover:bg-[#FBF9F6] transition-colors cursor-pointer"
                    >
                      {uploadingProfile ? 'Uploading...' : 'Change Photo'}
                    </button>
                    
                    {images[0] && (
                      <button
                        type="button"
                        onClick={handleProfilePicRemove}
                        className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl pl-8 pr-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Location Base</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Niche Description</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Lifestyle & Aesthetics"
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Short Bio Intro</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Full Portfolio Letter</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Write a personal note or biography for your profile..."
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* VSCO Gallery Manager */}
            <div className="bg-white border border-near-black/5 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center border-b border-near-black/5 pb-3 mb-6">
                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-near-black leading-none mb-1">
                    VSCO Gallery Grid
                  </h3>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Curate your aesthetic feed</span>
                </div>
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-coral hover:bg-coral-hover text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              {images.length <= 1 ? (
                <div className="border-2 border-dashed border-near-black/5 rounded-xl py-12 px-6 text-center text-neutral-400 flex flex-col items-center justify-center">
                  <Sparkles className="w-6 h-6 text-coral/30 mb-2 animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-near-black">Your Gallery is Empty</p>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-[240px]">Click &quot;Add Photo&quot; to upload images and curate your Pinterest-style grid.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.slice(1).map((src, index) => {
                    const actualIndex = index + 1;
                    return (
                      <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-50 border border-near-black/5 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={src} 
                          alt={`Gallery ${actualIndex}`} 
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                          <button
                            type="button"
                            onClick={() => handleImageDelete(actualIndex)}
                            className="self-end p-1.5 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-100 border border-white/10 rounded-lg transition-colors"
                            title="Delete image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMakeCover(actualIndex)}
                            className="w-full py-1.5 bg-white/90 hover:bg-white text-coral rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all"
                          >
                            Make Cover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Quick Actions / Save widget (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-[104px]">
            <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-near-black">Publish Changes</h4>
              <p className="text-[10px] text-neutral-400">Save changes to publish them immediately to your bio link page.</p>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <span>Save & Publish</span>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>

      <footer className="mt-20 py-8 border-t border-near-black/5 text-center text-neutral-400 text-[10px]">
        Sway Spaces Portal &bull; Powered by SwayHouse
      </footer>
    </main>
  );
}
