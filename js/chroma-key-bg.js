/**
 * SwayHouse Branding Logo Background Animation & Visibility Engine
 * Keys out white background once on load, animates rotation/movement via scrolling with physics-based lerp,
 * and fades out dynamically in content-focused areas (Roster, Contact, and active form inputs).
 */
(function() {
  'use strict';

  // Do not run on creator profile pages (subdirectories)
  if (window.location.pathname.includes('/creators/')) {
    return;
  }

  document.addEventListener('DOMContentLoaded', initLogoBackground);

  function initLogoBackground() {
    const isMobile = window.innerWidth < 768;
    
    // Load official 2D logo image
    const img = new Image();
    img.src = '/assets/swayhouse-logo.png';
    
    img.onload = () => {
      // Create a temporary hidden canvas to key out the white background once
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      
      tempCtx.drawImage(img, 0, 0);
      
      // Perform chroma key (white background to transparent)
      const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = frame.data;
      const len = data.length;
      
      for (let i = 0; i < len; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness of the pixel
        const brightness = (r + g + b) / 3;
        
        if (brightness > 245) {
          // Off-whites and pure whites become fully transparent
          data[i + 3] = 0;
        } else if (brightness > 200) {
          // Edge feathering / anti-aliasing blend
          const alphaFactor = (245 - brightness) / 45;
          data[i + 3] = Math.floor(data[i + 3] * alphaFactor);
        }
      }
      
      tempCtx.putImageData(frame, 0, 0);
      
      // Generate a transparent PNG data URL
      const dataUrl = tempCanvas.toDataURL('image/png');
      
      // Create visible floating background image
      const logoImg = document.createElement('img');
      logoImg.src = dataUrl;
      logoImg.className = 'chroma-bg-container';
      document.body.appendChild(logoImg);

      // Smooth scrolling rotation & translation physics (lerp)
      let targetRotation = 0;
      let currentRotation = 0;
      let targetY = 0;
      let currentY = 0;
      let animationId = null;

      const handleScroll = () => {
        const scrolled = window.scrollY;
        // Desktop: rotates 0.05 degrees per pixel, moves 0.03px per pixel
        // Mobile: keeps rotation stationary or very slow to save rendering load
        targetRotation = isMobile ? scrolled * 0.015 : scrolled * 0.04;
        targetY = isMobile ? scrolled * 0.02 : scrolled * 0.04;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      function updateAnimation() {
        if (document.hidden) {
          animationId = requestAnimationFrame(updateAnimation);
          return;
        }

        // Lerp factor (0.07 creates a buttery smooth floating drag effect)
        currentRotation += (targetRotation - currentRotation) * 0.07;
        currentY += (targetY - currentY) * 0.07;

        // Apply hardware-accelerated 3D transforms
        logoImg.style.transform = `translate(-50%, -50%) translate3d(0, ${currentY}px, 0) rotate(${currentRotation}deg)`;
        
        animationId = requestAnimationFrame(updateAnimation);
      }
      
      animationId = requestAnimationFrame(updateAnimation);

      // Visibility Rules for Content-Focused Areas
      const creatorsSec = document.getElementById('creators');
      const contactSec = document.getElementById('contact');
      
      let creatorsVisible = false;
      let contactVisible = false;
      let formFocused = false;

      function updateVisibility() {
        const shouldHide = creatorsVisible || contactVisible || formFocused;
        if (shouldHide) {
          logoImg.classList.add('hidden-state');
        } else {
          logoImg.classList.remove('hidden-state');
        }
      }

      // Intersection Observer for sections
      if (creatorsSec || contactSec) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.target.id === 'creators') {
              creatorsVisible = entry.isIntersecting;
            }
            if (entry.target.id === 'contact') {
              contactVisible = entry.isIntersecting;
            }
            updateVisibility();
          });
        }, {
          threshold: 0.02,
          rootMargin: '-80px 0px -80px 0px' // Fade out slightly before section enters
        });

        if (creatorsSec) observer.observe(creatorsSec);
        if (contactSec) observer.observe(contactSec);
      }

      // Hide when any input, textarea, or button inside a form is focused
      const formElements = document.querySelectorAll('input, textarea, select, button');
      formElements.forEach(el => {
        // Exclude general navigation links or non-form buttons
        if (el.closest('form') || el.id === 'hamburger') {
          el.addEventListener('focus', () => {
            formFocused = true;
            updateVisibility();
          });
          el.addEventListener('blur', () => {
            formFocused = false;
            updateVisibility();
          });
        }
      });
    };
  }
})();
