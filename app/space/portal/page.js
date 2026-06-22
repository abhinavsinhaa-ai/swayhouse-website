'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Instagram, MapPin, Tag, 
  Trash2, Upload, LogOut, ExternalLink, Check, Loader2, Sparkles, AlertCircle, Copy, X 
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
  const [gender, setGender] = useState('prefer_not_to_say');
  const [generatingBio, setGeneratingBio] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [cropperCaption, setCropperCaption] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingCaptionIndex, setGeneratingCaptionIndex] = useState(null);

  // Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [cropperType, setCropperType] = useState('gallery'); // 'profile' | 'gallery'
  const [aspectRatio, setAspectRatio] = useState(1); // 1, 0.8, 1.777, 'free'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [cropBox, setCropBox] = useState({ x: 40, y: 40, w: 260, h: 260 });
  const [resizingCorner, setResizingCorner] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, box: { x: 40, y: 40, w: 260, h: 260 } });

  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const imageDomRef = useRef(null);
  const cropBoxDomRef = useRef(null);

  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const cropBoxRef = useRef({ x: 40, y: 40, w: 260, h: 260 });

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
        setGender(p.gender || 'prefer_not_to_say');
        setCaptions(p.captions || []);
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
          images,
          gender,
          captions
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

  const handleGenerateBio = async () => {
    setGeneratingBio(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_bio',
          details: {
            image: images[0] || null,
            gender: gender
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setBio(data.result.trim().replace(/^["']|["']$/g, ''));
        setSuccessMsg('Aesthetic bio generated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to generate bio.');
      }
    } catch (err) {
      console.error('Error generating bio:', err);
      setErrorMsg('Network error. Failed to generate bio.');
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleGenerateCaption = async () => {
    setGeneratingCaption(true);
    try {
      const res = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_caption',
          details: {
            image: cropperImageSrc
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setCropperCaption(data.result.trim().replace(/^["']|["']$/g, ''));
      } else {
        alert(data.error || 'Failed to generate caption.');
      }
    } catch (err) {
      console.error('Error generating caption:', err);
      alert('Network error. Failed to generate caption.');
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleGenerateCaptionForIndex = async (index, src) => {
    setGeneratingCaptionIndex(index);
    try {
      const res = await fetch('/api/swayai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_caption',
          details: {
            image: src
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.result) {
        const newCaptions = [...captions];
        newCaptions[index] = data.result.trim().replace(/^["']|["']$/g, '');
        setCaptions(newCaptions);
      } else {
        alert(data.error || 'Failed to generate caption.');
      }
    } catch (err) {
      console.error('Error generating caption:', err);
      alert('Network error. Failed to generate caption.');
    } finally {
      setGeneratingCaptionIndex(null);
    }
  };

  const handleImageDelete = (indexToDelete) => {
    setImages(images.filter((_, idx) => idx !== indexToDelete));
    setCaptions(captions.filter((_, idx) => idx !== indexToDelete));
  };

  const clampPanAndZoom = (currentZoom, currentPan, box, customRatio = null) => {
    const containerWidth = 340;
    const containerHeight = 340;
    const imageRatio = customRatio !== null ? customRatio : imageAspectRatio;
    const containerRatio = 1;

    let imgRenderedWidth, imgRenderedHeight;
    if (imageRatio > containerRatio) {
      imgRenderedWidth = containerWidth;
      imgRenderedHeight = containerWidth / imageRatio;
    } else {
      imgRenderedHeight = containerHeight;
      imgRenderedWidth = containerHeight * imageRatio;
    }

    const minZoomX = box.w / imgRenderedWidth;
    const minZoomY = box.h / imgRenderedHeight;
    const minZoom = Math.max(minZoomX, minZoomY);
    
    const clampedZoom = Math.max(minZoom, Math.min(4.0, currentZoom));

    const cropLeft = box.x;
    const cropRight = box.x + box.w;
    const cropTop = box.y;
    const cropBottom = box.y + box.h;

    const minX = cropRight - 170 - (clampedZoom * imgRenderedWidth) / 2;
    const maxX = cropLeft - 170 + (clampedZoom * imgRenderedWidth) / 2;

    const minY = cropBottom - 170 - (clampedZoom * imgRenderedHeight) / 2;
    const maxY = cropTop - 170 + (clampedZoom * imgRenderedHeight) / 2;

    const clampedPan = { 
      x: Math.max(minX, Math.min(maxX, currentPan.x)),
      y: Math.max(minY, Math.min(maxY, currentPan.y))
    };

    return { zoom: clampedZoom, pan: clampedPan };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const imageRatio = img.width / img.height;
        setImageAspectRatio(imageRatio);
        setCropperImageSrc(reader.result);
        setCropperType('gallery');
        setAspectRatio(1); // default to square
        setCropperCaption('');

        const initialBox = { x: 40, y: 40, w: 260, h: 260 };
        const initialClamped = clampPanAndZoom(1, { x: 0, y: 0 }, initialBox, imageRatio);
        zoomRef.current = initialClamped.zoom;
        panRef.current = initialClamped.pan;
        cropBoxRef.current = initialBox;

        setCropBox(initialBox);
        setZoom(initialClamped.zoom);
        setPan(initialClamped.pan);
        setCropperOpen(true);
      };
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const imageRatio = img.width / img.height;
        setImageAspectRatio(imageRatio);
        setCropperImageSrc(reader.result);
        setCropperType('profile');
        setAspectRatio(0.8); // default to portrait
        setCropperCaption('');

        const initialBox = { x: 58, y: 30, w: 224, h: 280 };
        const initialClamped = clampPanAndZoom(1, { x: 0, y: 0 }, initialBox, imageRatio);
        zoomRef.current = initialClamped.zoom;
        panRef.current = initialClamped.pan;
        cropBoxRef.current = initialBox;

        setCropBox(initialBox);
        setZoom(initialClamped.zoom);
        setPan(initialClamped.pan);
        setCropperOpen(true);
      };
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
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

    const newCaptions = [...captions];
    const tempCaption = newCaptions[0];
    newCaptions[0] = newCaptions[index];
    newCaptions[index] = tempCaption;
    setCaptions(newCaptions);
  };

  // Dragging and Resizing event handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - panRef.current.x, y: clientY - panRef.current.y });
  };

  const handleResizeStart = (corner, e) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingCorner(corner);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setResizeStart({
      x: clientX,
      y: clientY,
      box: { ...cropBoxRef.current }
    });
  };

  const handlePointerMove = (e) => {
    if (resizingCorner) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - resizeStart.x;
      const dy = clientY - resizeStart.y;

      let newBox = { ...resizeStart.box };
      const containerSize = 340;

      if (resizingCorner === 'tl') {
        const newX = Math.min(resizeStart.box.x + resizeStart.box.w - 50, Math.max(0, resizeStart.box.x + dx));
        const newY = Math.min(resizeStart.box.y + resizeStart.box.h - 50, Math.max(0, resizeStart.box.y + dy));
        newBox.w = resizeStart.box.x + resizeStart.box.w - newX;
        newBox.h = resizeStart.box.y + resizeStart.box.h - newY;
        newBox.x = newX;
        newBox.y = newY;
      } else if (resizingCorner === 'tr') {
        const newY = Math.min(resizeStart.box.y + resizeStart.box.h - 50, Math.max(0, resizeStart.box.y + dy));
        const newW = Math.min(containerSize - resizeStart.box.x, Math.max(50, resizeStart.box.w + dx));
        newBox.w = newW;
        newBox.h = resizeStart.box.y + resizeStart.box.h - newY;
        newBox.y = newY;
      } else if (resizingCorner === 'bl') {
        const newX = Math.min(resizeStart.box.x + resizeStart.box.w - 50, Math.max(0, resizeStart.box.x + dx));
        const newH = Math.min(containerSize - resizeStart.box.y, Math.max(50, resizeStart.box.h + dy));
        newBox.x = newX;
        newBox.w = resizeStart.box.x + resizeStart.box.w - newX;
        newBox.h = newH;
      } else if (resizingCorner === 'br') {
        const newW = Math.min(containerSize - resizeStart.box.x, Math.max(50, resizeStart.box.w + dx));
        const newH = Math.min(containerSize - resizeStart.box.y, Math.max(50, resizeStart.box.h + dy));
        newBox.w = newW;
        newBox.h = newH;
      }

      const clamped = clampPanAndZoom(zoomRef.current, panRef.current, newBox);
      zoomRef.current = clamped.zoom;
      panRef.current = clamped.pan;
      cropBoxRef.current = newBox;

      // DOM style updates for performance (lag elimination)
      if (cropBoxDomRef.current) {
        cropBoxDomRef.current.style.width = `${newBox.w}px`;
        cropBoxDomRef.current.style.height = `${newBox.h}px`;
        cropBoxDomRef.current.style.left = `${newBox.x}px`;
        cropBoxDomRef.current.style.top = `${newBox.y}px`;
      }
      if (imageDomRef.current) {
        imageDomRef.current.style.transform = `scale(${clamped.zoom}) translate(${clamped.pan.x}px, ${clamped.pan.y}px)`;
      }
    } else if (isDragging) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rawPan = {
        x: clientX - dragStart.x,
        y: clientY - dragStart.y
      };
      const clamped = clampPanAndZoom(zoomRef.current, rawPan, cropBoxRef.current);
      panRef.current = clamped.pan;

      // DOM style updates for performance (lag elimination)
      if (imageDomRef.current) {
        imageDomRef.current.style.transform = `scale(${zoomRef.current}) translate(${clamped.pan.x}px, ${clamped.pan.y}px)`;
      }
    }
  };

  const handlePointerEnd = () => {
    setIsDragging(false);
    setResizingCorner(null);
    // Sync React states once
    setZoom(zoomRef.current);
    setPan(panRef.current);
    setCropBox(cropBoxRef.current);
  };

  const handleZoomChange = (newVal) => {
    const clamped = clampPanAndZoom(newVal, panRef.current, cropBoxRef.current);
    zoomRef.current = clamped.zoom;
    panRef.current = clamped.pan;
    setZoom(clamped.zoom);
    setPan(clamped.pan);

    if (imageDomRef.current) {
      imageDomRef.current.style.transform = `scale(${clamped.zoom}) translate(${clamped.pan.x}px, ${clamped.pan.y}px)`;
    }
  };

  const selectPresetRatio = (ratio) => {
    let w = 260;
    let h = 260;
    if (ratio === 0.8) {
      w = 224;
      h = 280;
    } else if (ratio === 1.777) {
      w = 300;
      h = 169;
    } else if (ratio === 'free') {
      const maxW = 300;
      const maxH = 280;
      if (imageAspectRatio > maxW / maxH) {
        w = maxW;
        h = maxW / imageAspectRatio;
      } else {
        h = maxH;
        w = maxH * imageAspectRatio;
      }
    }
    
    const newBox = {
      x: (340 - w) / 2,
      y: (340 - h) / 2,
      w,
      h
    };
    
    const clamped = clampPanAndZoom(zoomRef.current, panRef.current, newBox);
    zoomRef.current = clamped.zoom;
    panRef.current = clamped.pan;
    cropBoxRef.current = newBox;

    setAspectRatio(ratio);
    setCropBox(newBox);
    setZoom(clamped.zoom);
    setPan(clamped.pan);

    if (cropBoxDomRef.current) {
      cropBoxDomRef.current.style.width = `${newBox.w}px`;
      cropBoxDomRef.current.style.height = `${newBox.h}px`;
      cropBoxDomRef.current.style.left = `${newBox.x}px`;
      cropBoxDomRef.current.style.top = `${newBox.y}px`;
    }
    if (imageDomRef.current) {
      imageDomRef.current.style.transform = `scale(${clamped.zoom}) translate(${clamped.pan.x}px, ${clamped.pan.y}px)`;
    }
  };

  const handleCropSave = () => {
    const image = new Image();
    image.src = cropperImageSrc;
    image.onload = () => {
      const containerWidth = 340;
      const containerHeight = 340;
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const containerRatio = containerWidth / containerHeight;
      const imageRatio = naturalWidth / naturalHeight;

      let imgRenderedWidth, imgRenderedHeight;
      if (imageRatio > containerRatio) {
        imgRenderedWidth = containerWidth;
        imgRenderedHeight = containerWidth / imageRatio;
      } else {
        imgRenderedHeight = containerHeight;
        imgRenderedWidth = containerHeight * imageRatio;
      }

      const W = cropBox.w;
      const H = cropBox.h;
      const cropLeft = cropBox.x;
      const cropTop = cropBox.y;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scaleFactor = 3;

      canvas.width = W * scaleFactor;
      canvas.height = H * scaleFactor;
      ctx.scale(scaleFactor, scaleFactor);

      // Fill canvas background with white to avoid black margins on zoom out
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.translate(-cropLeft, -cropTop);
      ctx.translate(containerWidth / 2, containerHeight / 2);
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-imgRenderedWidth / 2, -imgRenderedHeight / 2);

      ctx.drawImage(image, 0, 0, imgRenderedWidth, imgRenderedHeight);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileExt = 'jpg';
        const fileName = cropperType === 'profile'
          ? `spaces/${profile.id}/profile-${Date.now()}.${fileExt}`
          : `spaces/${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        await executeUpload(file, cropperType);
      }, 'image/jpeg', 0.92);
    };
  };

  const executeUpload = async (file, type) => {
    if (type === 'profile') {
      setUploadingProfile(true);
    } else {
      setUploading(true);
    }
    setErrorMsg('');
    setCropperOpen(false);

    try {
      if (!supabase || !supabase.storage) { 
        console.warn('[STORAGE MOCK] Supabase is not configured. Reading cropped file as local data URL.');
        const reader = new FileReader();
        reader.onloadend = () => {
          const simulatedUrl = reader.result;
          if (type === 'profile') {
            const newImages = [...images];
            if (newImages.length > 0) {
              newImages[0] = simulatedUrl;
            } else { 
              newImages.push(simulatedUrl);
            }
            setImages(newImages);
            const newCaptions = [...captions];
            newCaptions[0] = '';
            setCaptions(newCaptions);
          } else {
            setImages([...images, simulatedUrl]);
            setCaptions([...captions, cropperCaption || '']);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data, error } = await supabase.storage
        .from('creator-assets')
        .upload(file.name, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-assets')
        .getPublicUrl(file.name);

      if (type === 'profile') {
        const newImages = [...images];
        if (newImages.length > 0) {
          newImages[0] = publicUrl;
        } else {
          newImages.push(publicUrl);
        }
        setImages(newImages);
        const newCaptions = [...captions];
        newCaptions[0] = '';
        setCaptions(newCaptions);
      } else {
        setImages([...images, publicUrl]);
        setCaptions([...captions, cropperCaption || '']);
      }
    } catch (err) {
      console.error('Upload failed error:', err);
      setErrorMsg(`Upload failed: ${err.message || 'Check storage configuration.'}`);
    } finally {
      setUploading(false);
      setUploadingProfile(false);
    }
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
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-coral transition-colors"
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
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Gender Orientation</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all cursor-pointer font-sans"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
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
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Short Bio Intro</label>
                    <button
                      type="button"
                      disabled={generatingBio}
                      onClick={handleGenerateBio}
                      className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-coral hover:text-coral-hover disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {generatingBio ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Analyzing Picture...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Generate with Sway AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="An ultra-minimalistic aesthetic bio..."
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-coral transition-all resize-none"
                  />
                  <p className="text-[8px] text-neutral-400">
                    Sway AI will analyze your profile avatar picture and gender to curate a bespoke minimal bio.
                  </p>
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
                    Sway Space Gallery Grid
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
                <div className="columns-2 sm:columns-3 gap-4">
                  {images.slice(1).reverse().map((src, index) => {
                    const actualIndex = images.length - 1 - index;
                    return (
                      <div key={index} className="break-inside-avoid mb-4 rounded-xl overflow-hidden bg-white border border-near-black/5 shadow-sm flex flex-col">
                        <div className="relative group overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={src} 
                            alt={`Gallery ${actualIndex}`} 
                            className="w-full h-auto block"
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
                        <div className="p-2 border-t border-near-black/5 flex flex-col gap-1 bg-[#FBF9F6]/50">
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">Caption</span>
                            <button
                              type="button"
                              disabled={generatingCaptionIndex === actualIndex}
                              onClick={() => handleGenerateCaptionForIndex(actualIndex, src)}
                              className="text-[8px] font-bold uppercase tracking-wider text-coral hover:text-coral-hover disabled:opacity-50 transition-colors flex items-center gap-0.5"
                            >
                              {generatingCaptionIndex === actualIndex ? '...' : '✨ SwayAI'}
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="No caption set"
                            value={captions[actualIndex] || ''}
                            onChange={(e) => {
                              const newCaptions = [...captions];
                              newCaptions[actualIndex] = e.target.value;
                              setCaptions(newCaptions);
                            }}
                            className="w-full bg-white border border-near-black/5 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-coral"
                          />
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
      {/* ===== INSTAGRAM STYLE CROPPER MODAL ===== */}
      <AnimatePresence>
        {cropperOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-near-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-[420px] shadow-2xl border border-near-black/5 flex flex-col gap-6 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setCropperOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-near-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className="font-cormorant text-2xl font-bold text-near-black leading-none mb-1">
                  Adjust photo
                </h3>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                  Crop, zoom, and center your image
                </p>
              </div>

              {/* Crop Frame Area */}
              <div 
                className="w-full h-[340px] bg-neutral-900 overflow-hidden relative rounded-2xl select-none cursor-move flex items-center justify-center border border-near-black/5"
                onMouseDown={handleDragStart}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerEnd}
                onMouseLeave={handlePointerEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerEnd}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageDomRef}
                  src={cropperImageSrc}
                  alt="Crop Preview"
                  draggable={false}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                />

                {/* Overlay bounding crop frame */}
                <div 
                  ref={cropBoxDomRef}
                  className="absolute border border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-lg pointer-events-none"
                  style={{
                    width: `${cropBox.w}px`,
                    height: `${cropBox.h}px`,
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`
                  }} 
                >
                  {/* Bounding grid lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/20 pointer-events-none">
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="border-r border-white/20" />
                    <div />
                  </div>

                  {/* Corner Handles (iPhone Style) */}
                  <div 
                    onMouseDown={(e) => handleResizeStart('tl', e)}
                    onTouchStart={(e) => handleResizeStart('tl', e)}
                    className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize pointer-events-auto z-10"
                  >
                    <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-white rounded-tl" />
                  </div>
                  <div 
                    onMouseDown={(e) => handleResizeStart('tr', e)}
                    onTouchStart={(e) => handleResizeStart('tr', e)}
                    className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize pointer-events-auto z-10"
                  >
                    <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-white rounded-tr" />
                  </div>
                  <div 
                    onMouseDown={(e) => handleResizeStart('bl', e)}
                    onTouchStart={(e) => handleResizeStart('bl', e)}
                    className="absolute -bottom-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize pointer-events-auto z-10"
                  >
                    <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-white rounded-bl" />
                  </div>
                  <div 
                    onMouseDown={(e) => handleResizeStart('br', e)}
                    onTouchStart={(e) => handleResizeStart('br', e)}
                    className="absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize pointer-events-auto z-10"
                  >
                    <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-white rounded-br" />
                  </div>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Zoom</span>
                  <span className="text-[10px] font-mono text-neutral-600 font-semibold">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">-</span>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-coral bg-neutral-100 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-neutral-400">+</span>
                </div>
              </div>

              {/* Aspect Ratio Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Aspect Ratio</span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { label: '1:1 Square', val: 1 },
                    { label: '4:5 Portrait', val: 0.8 },
                    { label: '16:9 Wide', val: 1.777 },
                    { label: 'Original', val: 'free' }
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => selectPresetRatio(r.val)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex-shrink-0 cursor-pointer ${
                        aspectRatio === r.val
                          ? 'border-coral bg-coral/5 text-coral font-bold'
                          : 'border-near-black/5 text-neutral-400 hover:text-near-black bg-[#FBF9F6]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption Input Section */}
              {cropperType === 'gallery' && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Caption</span>
                    <button
                      type="button"
                      disabled={generatingCaption}
                      onClick={handleGenerateCaption}
                      className="text-[9px] font-bold uppercase tracking-wider text-coral hover:text-coral-hover disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {generatingCaption ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : ( 
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Let SwayAI decide</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Write a personalized caption..."
                    value={cropperCaption}
                    onChange={(e) => setCropperCaption(e.target.value)}
                    className="w-full bg-[#FBF9F6] border border-near-black/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-coral transition-all"
                  />
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCropperOpen(false)}
                  className="flex-1 py-3 border border-near-black/5 hover:bg-neutral-50 rounded-xl text-[10px] font-bold uppercase tracking-wider text-neutral-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="flex-1 py-3 bg-coral hover:bg-coral-hover text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  Apply & Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
