"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ChromaBg() {
  const containerRef = useRef(null);
  const pathname = usePathname();

  // Exclude from rendering on creator profile pages
  const isProfilePage = pathname && pathname.includes('/creators');

  useEffect(() => {
    if (isProfilePage) return;

    let active = true;
    let animationId = null;
    let observer = null;
    const focusListeners = [];
    const blurListeners = [];
    
    const creatorsSec = document.getElementById('creators');
    const contactSec = document.getElementById('contact');

    let targetRotation = 0;
    let currentRotation = 0;
    let targetY = 0;
    let currentY = 0;
    let creatorsVisible = false;
    let contactVisible = false;
    let formFocused = false;
    let isLooping = false;

    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const scrolled = window.scrollY;
      targetRotation = isMobile ? scrolled * 0.015 : scrolled * 0.04;
      targetY = isMobile ? scrolled * 0.02 : scrolled * 0.04;

      if (!isLooping && !isMobile) {
        isLooping = true;
        animationId = requestAnimationFrame(() => updateAnimation(containerRef.current));
      }
    };

    function updateVisibility(logoImg) {
      if (!logoImg) return;
      const shouldHide = creatorsVisible || contactVisible || formFocused;
      if (shouldHide) {
        logoImg.classList.add('hidden-state');
      } else {
        logoImg.classList.remove('hidden-state');
      }
    }

    function updateAnimation(logoImg) {
      if (!logoImg) {
        isLooping = false;
        animationId = null;
        return;
      }

      if (document.hidden) {
        animationId = requestAnimationFrame(() => updateAnimation(logoImg));
        return;
      }

      const diffRotation = targetRotation - currentRotation;
      const diffY = targetY - currentY;

      // If the values are very close, snap them and stop the animation loop to save CPU/GPU cycles
      if (Math.abs(diffRotation) < 0.01 && Math.abs(diffY) < 0.1) {
        currentRotation = targetRotation;
        currentY = targetY;
        logoImg.style.transform = `translate(-50%, -50%) translate3d(0, ${currentY}px, 0) rotate(${currentRotation}deg)`;
        isLooping = false;
        animationId = null;
        return;
      }

      currentRotation += diffRotation * 0.07;
      currentY += diffY * 0.07;

      logoImg.style.transform = `translate(-50%, -50%) translate3d(0, ${currentY}px, 0) rotate(${currentRotation}deg)`;
      
      animationId = requestAnimationFrame(() => updateAnimation(logoImg));
    }

    // Load official 2D logo image
    const img = new Image();
    img.src = '/assets/swayhouse-logo.png';
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (!active) return;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      tempCtx.drawImage(img, 0, 0);
      
      const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = frame.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > 245) {
          data[i + 3] = 0;
        } else if (brightness > 200) {
          const alphaFactor = (245 - brightness) / 45;
          data[i + 3] = Math.floor(data[i + 3] * alphaFactor);
        }
      }
      
      tempCtx.putImageData(frame, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/png');
      
      const logoImg = containerRef.current;
      const isMobile = window.innerWidth < 768;
      if (logoImg) {
        logoImg.src = dataUrl;
        if (isMobile) {
          logoImg.style.transform = 'translate(-50%, -50%)';
          logoImg.style.opacity = '0.04';
        } else {
          logoImg.style.opacity = '0.08';
        }
      }

      if (isMobile) {
        // Skip scroll listeners, focus tracking, and animation loops on mobile
        return;
      }

      // Scroll listener
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Start loop
      isLooping = true;
      animationId = requestAnimationFrame(() => updateAnimation(logoImg));

      // Intersection Observer for sections
      if (creatorsSec || contactSec) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.target.id === 'creators') {
              creatorsVisible = entry.isIntersecting;
            }
            if (entry.target.id === 'contact') {
              contactVisible = entry.isIntersecting;
            }
            updateVisibility(logoImg);
          });
        }, {
          threshold: 0.02,
          rootMargin: '-80px 0px -80px 0px'
        });

        if (creatorsSec) observer.observe(creatorsSec);
        if (contactSec) observer.observe(contactSec);
      }

      // Hide when any input, textarea, or button inside a form is focused
      const formElements = document.querySelectorAll('input, textarea, select, button');
      formElements.forEach(el => {
        if (el.closest('form') || el.id === 'hamburger') {
          const onFocus = () => {
            formFocused = true;
            updateVisibility(logoImg);
          };
          const onBlur = () => {
            formFocused = false;
            updateVisibility(logoImg);
          };
          el.addEventListener('focus', onFocus);
          el.addEventListener('blur', onBlur);
          focusListeners.push({ el, handler: onFocus });
          blurListeners.push({ el, handler: onBlur });
        }
      });
    };

    return () => {
      active = false;
      window.removeEventListener('scroll', handleScroll);
      if (animationId) cancelAnimationFrame(animationId);
      if (observer) {
        if (creatorsSec) observer.unobserve(creatorsSec);
        if (contactSec) observer.unobserve(contactSec);
      }
      focusListeners.forEach(({ el, handler }) => el.removeEventListener('focus', handler));
      blurListeners.forEach(({ el, handler }) => el.removeEventListener('blur', handler));
    };
  }, [isProfilePage]);

  if (isProfilePage) return null;

  return (
    <img 
      ref={containerRef} 
      className="chroma-bg-container" 
      alt="SwayHouse Background Logo" 
      style={{ opacity: 0 }} // Starts hidden, opacity set on load
    />
  );
}
