'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Instagram, MapPin, Tag, Calendar, Heart, 
  Trash2, Upload, LogOut, ExternalLink, Check, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export default function CreatorPortal() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [niche, setNiche] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creators/profile');
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
        router.push('/creators/login');
      }
    } catch (err) {
      console.error('Error fetching creator profile:', err);
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
      const res = await fetch('/api/creators/profile', {
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
        // Clear message after 4s
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
      await fetch('/api/creators/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      router.push('/creators/login');
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      // Mock mode fallback if Supabase is not configured
      if (!supabase || !supabase.storage) {
        console.warn('[STORAGE MOCK] Supabase is not configured. Simulating image upload.');
        
        // Use a high-quality free stock portrait or landscape based on random query
        const mockRandomId = Math.floor(Math.random() * 1000);
        const simulatedUrl = `https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80&sig=${mockRandomId}`;
        
        setImages([...images, simulatedUrl]);
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('creator-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        // If bucket doesn't exist or RLS issue, report it
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('creator-assets')
        .getPublicUrl(fileName);

      setImages([...images, publicUrl]);
    } catch (err) {
      console.error('Upload failed error:', err);
      setErrorMsg(`Image upload failed: ${err.message || 'Make sure the "creator-assets" storage bucket is created and set to public.'}`);
    } finally {
      setUploading(false);
      // Reset file input
      if (e.target) e.target.value = '';
    }
  };

  // Reorder cover photo helper (swaps chosen index to index 0)
  const handleMakeCover = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center text-neutral-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading Creator Portal...</span>
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
              <h1 className="font-cormorant text-xl font-bold text-near-black leading-none">Creator Studio</h1>
              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Manage Your Roster Profile</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href={`/creators/${profile?.id}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-coral transition-colors"
            >
              <span>View Live Portfolio</span>
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
                Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-coral" /> Display Name
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
                    <Calendar className="w-3 h-3 text-coral" /> Age
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-coral" /> Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Instagram className="w-3 h-3 text-coral" /> Instagram Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. handle"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-coral" /> Niche / Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lifestyle & Feel Good"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bios & Message Cards */}
            <div className="bg-white border border-near-black/5 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <h3 className="font-cormorant text-2xl font-bold text-near-black border-b border-near-black/5 pb-3">
                Biography & Creative Statements
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  Short Bio (Shown on cards & layout sidebars)
                </label>
                <textarea
                  required
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your creative style and message in 2 sentences..."
                  className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none resize-none focus:ring-1 focus:ring-coral transition-all leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  Full Portfolio Message (Displays as the editorial letter on your profile)
                </label>
                <textarea
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a personal letter to your visitors, sharing what drives your content and brand mission..."
                  className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none resize-none focus:ring-1 focus:ring-coral transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Gallery image updates (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Save Buttons Panel */}
            <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-xl bg-near-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Publish Portfolio Updates'
                )}
              </button>

              <Link
                href={`/creators/${profile?.id}`}
                target="_blank"
                className="w-full py-3.5 rounded-xl border border-near-black/5 text-near-black text-center text-xs font-bold uppercase tracking-wider hover:bg-[#FBF9F6] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Preview Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Media Gallery Panel */}
            <div className="bg-white border border-near-black/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-near-black/5 pb-3">
                <h3 className="font-cormorant text-2xl font-bold text-near-black">
                  Gallery Photos
                </h3>
                <span className="text-[10px] text-neutral-400 font-bold">{images.length} photos</span>
              </div>

              {/* Upload button wrapper */}
              <div className="flex flex-col gap-2">
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
                  className="w-full py-4 border-2 border-dashed border-near-black/10 hover:border-coral/30 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors group cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-coral" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Uploading to server...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-neutral-400 group-hover:text-coral transition-colors" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 group-hover:text-near-black transition-colors">Add Gallery Photo</span>
                      <span className="text-[8px] text-neutral-400 font-medium">JPEG, PNG up to 10MB</span>
                    </>
                  )}
                </button>
              </div>

              {/* Photos List */}
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                {images.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic text-center py-6">No photos in portfolio yet.</p>
                ) : (
                  images.map((src, idx) => {
                    const isCover = idx === 0;
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-3 p-2.5 rounded-xl border transition-all ${
                          isCover 
                            ? 'border-coral/20 bg-coral/5 shadow-sm' 
                            : 'border-near-black/5 bg-soft-white/30 hover:border-near-black/10'
                        }`}
                      >
                        {/* Thumbnail */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={src} 
                          alt={`Thumbnail ${idx}`} 
                          className="w-12 h-15 object-cover rounded-lg bg-neutral-100 flex-shrink-0"
                        />

                        {/* Actions */}
                        <div className="flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block ${
                              isCover ? 'bg-coral text-white' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                              {isCover ? 'Cover Portrait' : `Gallery Image #${idx}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleMakeCover(idx)}
                                className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors"
                              >
                                Set as Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleImageDelete(idx)}
                              className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-0.5 ml-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
