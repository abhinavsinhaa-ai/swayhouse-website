'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Hide cursor on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Initial positioning
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 1, x: -100, y: -100 });

    const xSetter = gsap.quickSetter(cursor, "x", "px");
    const ySetter = gsap.quickSetter(cursor, "y", "px");

    const onMouseMove = (e) => {
      xSetter(e.clientX);
      ySetter(e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove);

    // Scale up and change fill on hovering clickable items
    const onMouseEnterClickable = () => {
      gsap.to(cursor, { 
        scale: 4, 
        backgroundColor: 'rgba(255, 107, 53, 0.15)', 
        border: '1.5px solid #FF6B35',
        duration: 0.25, 
        ease: 'power2.out' 
      });
    };

    const onMouseLeaveClickable = () => {
      gsap.to(cursor, { 
        scale: 1, 
        backgroundColor: '#FF6B35', 
        border: 'none',
        duration: 0.25, 
        ease: 'power2.out' 
      });
    };

    const attachHoverStates = () => {
      const clickables = document.querySelectorAll('a, button, [role="button"], .clickable');
      clickables.forEach((el) => {
        // Avoid duplicate listeners
        el.removeEventListener('mouseenter', onMouseEnterClickable);
        el.removeEventListener('mouseleave', onMouseLeaveClickable);
        
        el.addEventListener('mouseenter', onMouseEnterClickable);
        el.addEventListener('mouseleave', onMouseLeaveClickable);
      });
    };

    attachHoverStates();

    // Use MutationObserver to capture elements rendered dynamically (like roster cards or modals)
    const observer = new MutationObserver(attachHoverStates);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="w-2.5 h-2.5 bg-coral rounded-full fixed pointer-events-none z-[9999] hidden md:block transition-transform duration-75"
    />
  );
}
