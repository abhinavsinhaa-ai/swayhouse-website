'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Instagram, MapPin, Tag, Calendar, Heart, 
  Trash2, Upload, LogOut, ExternalLink, Check, Loader2, Sparkles, AlertCircle, X 
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
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [dates, setDates] = useState([]);
  const [musicTracks, setMusicTracks] = useState([]);
  const [musicArtists, setMusicArtists] = useState([]);
  const [musicPreviews, setMusicPreviews] = useState([]);
  const [musicOffsets, setMusicOffsets] = useState([]);

  // Search & Select Modal States
  const [musicSearchOpen, setMusicSearchOpen] = useState(false);
  const [musicIndex, setMusicIndex] = useState(null);
  const [musicQuery, setMusicQuery] = useState('');
  const [musicResults, setMusicResults] = useState([]);
  const [searchingMusic, setSearchingMusic] = useState(false);
  const [activeMusicTrack, setActiveMusicTrack] = useState(null);
  const [activeStartOffset, setActiveStartOffset] = useState(0);
  const [previewAudio, setPreviewAudio] = useState(null);

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
        setCaptions(p.captions || []);
        setDates(p.dates || []);
        setMusicTracks(p.musicTracks || []);
        setMusicArtists(p.musicArtists || []);
        setMusicPreviews(p.musicPreviews || []);
        setMusicOffsets(p.musicOffsets || []);
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

  // Music Selection functions
  const handleOpenMusicSearch = (index) => {
    setMusicIndex(index);
    setMusicQuery('');
    setMusicResults([]);
    
    // If there is already a song selected, pre-populate activeMusicTrack
    if (musicPreviews[index]) {
      setActiveMusicTrack({
        trackName: musicTracks[index],
        artistName: musicArtists[index],
        previewUrl: musicPreviews[index],
        trackId: 'existing'
      });
      setActiveStartOffset(parseInt(musicOffsets[index]) || 0);
    } else {
      setActiveMusicTrack(null);
      setActiveStartOffset(0);
    }
    
    setMusicSearchOpen(true);
  };

  const handleCloseMusicSearch = () => {
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
    }
    setActiveMusicTrack(null);
    setMusicSearchOpen(false);
  };

  const handleSearchMusic = async (e) => {
    if (e) e.preventDefault();
    if (!musicQuery.trim()) return;
    setSearchingMusic(true);
    try {
      const res = await fetch(`/api/music/search?term=${encodeURIComponent(musicQuery)}`);
      const data = await res.json();
      setMusicResults(data.results || []);
    } catch (err) {
      console.error('Music search failed:', err);
    } finally {
      setSearchingMusic(false);
    }
  };

  const playTrimmerPreview = (url, offset) => {
    if (previewAudio) {
      previewAudio.pause();
    }
    const audioObj = new Audio(url);
    audioObj.currentTime = offset;
    audioObj.loop = true;
    audioObj.play().catch(e => console.log('Audio preview block:', e));
    setPreviewAudio(audioObj);

    // Loop offset logic (limit clip to 15s to emulate trimmer preview)
    audioObj.ontimeupdate = () => {
      if (audioObj.currentTime >= offset + 15 || audioObj.currentTime >= audioObj.duration) {
        audioObj.currentTime = offset;
      }
    };
  };

  const handleOffsetChange = (val) => {
    setActiveStartOffset(val);
    if (activeMusicTrack) {
      playTrimmerPreview(activeMusicTrack.previewUrl, val);
    }
  };

  const handleSelectTrack = (track) => {
    setActiveMusicTrack(track);
    setActiveStartOffset(0);
    playTrimmerPreview(track.previewUrl, 0);
  };

  const handleSaveMusicTrack = () => {
    if (musicIndex === null || !activeMusicTrack) return;
    const newMusicTracks = [...musicTracks];
    const newMusicArtists = [...musicArtists];
    const newMusicPreviews = [...musicPreviews];
    const newMusicOffsets = [...musicOffsets];

    newMusicTracks[musicIndex] = activeMusicTrack.trackName;
    newMusicArtists[musicIndex] = activeMusicTrack.artistName;
    newMusicPreviews[musicIndex] = activeMusicTrack.previewUrl;
    newMusicOffsets[musicIndex] = String(activeStartOffset);

    setMusicTracks(newMusicTracks);
    setMusicArtists(newMusicArtists);
    setMusicPreviews(newMusicPreviews);
    setMusicOffsets(newMusicOffsets);

    handleCloseMusicSearch();
  };

  const handleRemoveMusicTrack = (index) => {
    const newMusicTracks = [...musicTracks];
    const newMusicArtists = [...musicArtists];
    const newMusicPreviews = [...musicPreviews];
    const newMusicOffsets = [...musicOffsets];

    newMusicTracks[index] = '';
    newMusicArtists[index] = '';
    newMusicPreviews[index] = '';
    newMusicOffsets[index] = '0';

    setMusicTracks(newMusicTracks);
    setMusicArtists(newMusicArtists);
    setMusicPreviews(newMusicPreviews);
    setMusicOffsets(newMusicOffsets);
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
          images,
          captions,
          dates,
          musicTracks,
          musicArtists,
          musicPreviews,
          musicOffsets
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
    setDates(dates.filter((_, idx) => idx !== indexToDelete));
    setMusicTracks(musicTracks.filter((_, idx) => idx !== indexToDelete));
    setMusicArtists(musicArtists.filter((_, idx) => idx !== indexToDelete));
    setMusicPreviews(musicPreviews.filter((_, idx) => idx !== indexToDelete));
    setMusicOffsets(musicOffsets.filter((_, idx) => idx !== indexToDelete));
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
          ? `${profile.id}/profile-${Date.now()}.${fileExt}`
          : `${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
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
            const newDates = [...dates];
            newDates[0] = '';
            setDates(newDates);

            const newMusicTracks = [...musicTracks];
            newMusicTracks[0] = '';
            setMusicTracks(newMusicTracks);
            const newMusicArtists = [...musicArtists];
            newMusicArtists[0] = '';
            setMusicArtists(newMusicArtists);
            const newMusicPreviews = [...musicPreviews];
            newMusicPreviews[0] = '';
            setMusicPreviews(newMusicPreviews);
            const newMusicOffsets = [...musicOffsets];
            newMusicOffsets[0] = '0';
            setMusicOffsets(newMusicOffsets);
          } else {
            setImages([...images, simulatedUrl]);
            setCaptions([...captions, cropperCaption || '']);
            const uploadDateObj = new Date();
            const uploadDateStr = `${uploadDateObj.getDate()} ${uploadDateObj.toLocaleString('en-US', { month: 'long' }).toUpperCase()} ${uploadDateObj.getFullYear()}`;
            setDates([...dates, uploadDateStr]);
            setMusicTracks([...musicTracks, '']);
            setMusicArtists([...musicArtists, '']);
            setMusicPreviews([...musicPreviews, '']);
            setMusicOffsets([...musicOffsets, '0']);
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
        const newDates = [...dates];
        newDates[0] = '';
        setDates(newDates);

        const newMusicTracks = [...musicTracks];
        newMusicTracks[0] = '';
        setMusicTracks(newMusicTracks);
        const newMusicArtists = [...musicArtists];
        newMusicArtists[0] = '';
        setMusicArtists(newMusicArtists);
        const newMusicPreviews = [...musicPreviews];
        newMusicPreviews[0] = '';
        setMusicPreviews(newMusicPreviews);
        const newMusicOffsets = [...musicOffsets];
        newMusicOffsets[0] = '0';
        setMusicOffsets(newMusicOffsets);
      } else {
        setImages([...images, publicUrl]);
        setCaptions([...captions, cropperCaption || '']);
        const uploadDateObj = new Date();
        const uploadDateStr = `${uploadDateObj.getDate()} ${uploadDateObj.toLocaleString('en-US', { month: 'long' }).toUpperCase()} ${uploadDateObj.getFullYear()}`;
        setDates([...dates, uploadDateStr]);
        setMusicTracks([...musicTracks, '']);
        setMusicArtists([...musicArtists, '']);
        setMusicPreviews([...musicPreviews, '']);
        setMusicOffsets([...musicOffsets, '0']);
      }
    } catch (err) {
      console.error('Upload failed error:', err);
      setErrorMsg(`Upload failed: ${err.message || 'Check storage configuration.'}`);
    } finally {
      setUploading(false);
      setUploadingProfile(false);
    }
  };

  const handleProfilePicRemove = () => {
    const newImages = [...images];
    newImages.shift(); // Remove first element (profile cover)
    setImages(newImages);

    const newCaptions = [...captions];
    newCaptions.shift();
    setCaptions(newCaptions);

    const newDates = [...dates];
    newDates.shift();
    setDates(newDates);

    const newMusicTracks = [...musicTracks];
    newMusicTracks.shift();
    setMusicTracks(newMusicTracks);
    const newMusicArtists = [...musicArtists];
    newMusicArtists.shift();
    setMusicArtists(newMusicArtists);
    const newMusicPreviews = [...musicPreviews];
    newMusicPreviews.shift();
    setMusicPreviews(newMusicPreviews);
    const newMusicOffsets = [...musicOffsets];
    newMusicOffsets.shift();
    setMusicOffsets(newMusicOffsets);
  };

  // Reorder cover photo helper (swaps chosen index to index 0)
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

    const newDates = [...dates];
    const tempDate = newDates[0];
    newDates[0] = newDates[index];
    newDates[index] = tempDate;
    setDates(newDates);

    const newMusicTracks = [...musicTracks];
    const tempMusicTrack = newMusicTracks[0];
    newMusicTracks[0] = newMusicTracks[index];
    newMusicTracks[index] = tempMusicTrack;
    setMusicTracks(newMusicTracks);

    const newMusicArtists = [...musicArtists];
    const tempMusicArtist = newMusicArtists[0];
    newMusicArtists[0] = newMusicArtists[index];
    newMusicArtists[index] = tempMusicArtist;
    setMusicArtists(newMusicArtists);

    const newMusicPreviews = [...musicPreviews];
    const tempMusicPreview = newMusicPreviews[0];
    newMusicPreviews[0] = newMusicPreviews[index];
    newMusicPreviews[index] = tempMusicPreview;
    setMusicPreviews(newMusicPreviews);

    const newMusicOffsets = [...musicOffsets];
    const tempMusicOffset = newMusicOffsets[0];
    newMusicOffsets[0] = newMusicOffsets[index];
    newMusicOffsets[index] = tempMusicOffset;
    setMusicOffsets(newMusicOffsets);
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
              href={profile?.is_space ? `/space/${profile?.id}` : `/creators/${profile?.id}`}
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
                  <h4 className="font-semibold text-xs text-near-black">Profile Picture</h4>
                  <p className="text-[10px] text-neutral-400">This photo will represent you as your primary cover portrait on the roster.</p>
                  
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
                {images.length <= 1 ? (
                  <p className="text-xs text-neutral-400 italic text-center py-6">No gallery photos added yet.</p>
                ) : (
                  images.slice(1).map((src, idx) => {
                    const actualIdx = idx + 1; // Map relative index to absolute index in images array
                    return (
                      <div 
                        key={actualIdx} 
                        className="flex flex-col gap-2 p-2.5 rounded-xl border border-near-black/5 bg-soft-white/30 hover:border-near-black/10 transition-all"
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={src} 
                            alt={`Thumbnail ${actualIdx}`} 
                            className="w-12 h-15 object-cover rounded-lg bg-neutral-100 flex-shrink-0"
                          />

                          {/* Actions */}
                          <div className="flex-grow flex flex-col justify-between py-0.5">
                            <div>
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block bg-neutral-100 text-neutral-500 font-semibold">
                                Gallery Image #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleMakeCover(actualIdx)}
                                className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-coral transition-colors"
                              >
                                Set as Profile
                              </button>

                              <button
                                type="button"
                                onClick={() => handleImageDelete(actualIdx)}
                                className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-0.5 ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-near-black/5 flex flex-col gap-2 bg-[#FBF9F6]/30 px-1 rounded-lg">
                          {/* Caption block */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">Caption</span>
                              <button
                                type="button"
                                disabled={generatingCaptionIndex === actualIdx}
                                onClick={() => handleGenerateCaptionForIndex(actualIdx, src)}
                                className="text-[8px] font-bold uppercase tracking-wider text-coral hover:text-coral-hover disabled:opacity-50 transition-colors flex items-center gap-0.5"
                              >
                                {generatingCaptionIndex === actualIdx ? '...' : '✨ SwayAI'}
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="No caption set"
                              value={captions[actualIdx] || ''}
                              onChange={(e) => {
                                const newCaptions = [...captions];
                                newCaptions[actualIdx] = e.target.value;
                                setCaptions(newCaptions);
                              }}
                              className="w-full bg-white border border-near-black/5 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-coral"
                            />
                          </div>

                          {/* Date block */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">Display Date</span>
                            <input
                              type="text"
                              placeholder="e.g. JUN 2026"
                              value={dates[actualIdx] || ''}
                              onChange={(e) => {
                                const newDates = [...dates];
                                newDates[actualIdx] = e.target.value;
                                setDates(newDates);
                              }}
                              className="w-full bg-white border border-near-black/5 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-coral"
                            />
                          </div>

                          {/* Music block */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">Background Music</span>
                            {musicTracks[actualIdx] ? (
                              <div className="flex items-center justify-between bg-white border border-near-black/5 rounded-lg px-2 py-1 text-[9px]">
                                <span className="font-semibold text-neutral-600 truncate max-w-[125px]">
                                  🎵 {musicTracks[actualIdx]}
                                </span>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMusicSearch(actualIdx)}
                                    className="text-[8px] font-bold uppercase tracking-wider text-coral hover:text-coral-hover transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMusicTrack(actualIdx)}
                                    className="text-[8px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenMusicSearch(actualIdx)}
                                className="w-full py-1 bg-white border border-dashed border-near-black/10 hover:border-coral/40 text-neutral-400 hover:text-coral rounded-lg text-[8px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                🎵 Add Music
                              </button>
                            )}
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
      {/* Background Music Search & Trimmer Modal */}
      <AnimatePresence>
        {musicSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 select-none"
            onClick={handleCloseMusicSearch}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-near-black/5 rounded-2xl p-6 max-w-[420px] w-full shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-near-black/5 pb-3">
                <h3 className="font-cormorant text-2xl font-bold text-near-black">Select Background Music</h3>
                <button
                  type="button"
                  onClick={handleCloseMusicSearch}
                  className="p-1 text-neutral-400 hover:text-near-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchMusic} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search songs, artists..."
                  value={musicQuery}
                  onChange={(e) => setMusicQuery(e.target.value)}
                  className="flex-1 bg-[#FBF9F6] border border-near-black/5 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-coral"
                />
                <button
                  type="submit"
                  disabled={searchingMusic}
                  className="px-4 py-2 bg-coral hover:bg-coral-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {searchingMusic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </button>
              </form>

              {/* Results List */}
              <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1.5 pr-1">
                {musicResults.length > 0 ? (
                  musicResults.map((track) => {
                    const isSelected = activeMusicTrack && activeMusicTrack.trackId === track.trackId;
                    return (
                      <div
                        key={track.trackId}
                        onClick={() => handleSelectTrack(track)}
                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-coral bg-coral/5 shadow-sm'
                            : 'border-near-black/5 hover:bg-[#FBF9F6]'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.artworkUrl60}
                          alt="Album Art"
                          className="w-10 h-10 rounded-lg object-cover shadow-sm select-none pointer-events-none"
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="text-xs font-bold text-near-black truncate select-none">
                            {track.trackName}
                          </span>
                          <span className="text-[10px] text-neutral-400 truncate select-none">
                            {track.artistName}
                          </span>
                        </div>
                        <div className="flex items-center justify-center">
                          {isSelected && previewAudio && !previewAudio.paused ? (
                            <div className="w-6 h-6 rounded-full bg-coral text-white flex items-center justify-center">
                              <span className="text-[10px]">⏸</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 hover:bg-coral/10 hover:text-coral flex items-center justify-center transition-colors">
                              <span className="text-[10px] ml-0.5">▶</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-[10px] text-neutral-400 select-none">
                    {searchingMusic ? 'Searching catalog...' : 'Type a song or artist name to search.'}
                  </div>
                )}
              </div>

              {/* Trimmer Area */}
              {activeMusicTrack && (
                <div className="border-t border-near-black/5 pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                    <span>Trim Duration (15s Preview)</span>
                    <span className="text-coral">Start Offset: {activeStartOffset}s</span>
                  </div>

                  {/* Scrubber slider */}
                  <div className="relative flex items-center py-2">
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={activeStartOffset}
                      onChange={(e) => handleOffsetChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-coral outline-none"
                    />
                    
                    {/* Glowing chorus/hotspot point at 5 seconds */}
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-coral border border-white shadow shadow-coral/50 cursor-pointer pointer-events-none"
                      style={{ left: '33.33%' }}
                      title="Catchy Part (Hotspot)"
                    />
                    {/* Glowing chorus/hotspot point at 10 seconds */}
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-coral border border-white shadow shadow-coral/50 cursor-pointer pointer-events-none"
                      style={{ left: '66.66%' }}
                      title="Chorus (Hotspot)"
                    />
                  </div>

                  <div className="flex gap-2 justify-center text-[9px] text-neutral-400 select-none">
                    <span>* Glowing dots represent catchy parts / chorus starts</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMusicTrack}
                    className="w-full py-3 bg-coral hover:bg-coral-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-sm mt-1"
                  >
                    Confirm Track Selection
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
