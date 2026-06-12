'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const mouseX = useRef(-100);
  const mouseY = useRef(-100);

  useEffect(() => {
    // Hide cursor on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Initial positioning via transform
    cursor.style.transform = `translate3d(-100px, -100px, 0) translate(-50%, -50%)`;

    const onMouseMove = (e) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let animationFrameId;
    const updateCursor = () => {
      cursor.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) translate(-50%, -50%)`;
      animationFrameId = requestAnimationFrame(updateCursor);
    };
    animationFrameId = requestAnimationFrame(updateCursor);

    let currentCursorType = 'default'; // default | hover | view

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const viewTarget = typeof target.closest === 'function' ? target.closest('[data-cursor="view"]') : null;
      const clickableTarget = typeof target.closest === 'function' ? target.closest('a, button, [role="button"], .clickable') : null;

      if (viewTarget) {
        if (currentCursorType !== 'view') {
          currentCursorType = 'view';
          gsap.to(cursor, {
            width: 80,
            height: 80,
            backgroundColor: '#FF6B35',
            border: 'none',
            borderRadius: '50%',
            duration: 0.3,
            ease: 'power3.out',
            overwrite: 'auto'
          });
          const span = cursor.querySelector('span');
          if (span) {
            span.style.opacity = '1';
            span.style.display = 'block';
          }
        }
      } else if (clickableTarget) {
        if (currentCursorType !== 'hover') {
          currentCursorType = 'hover';
          gsap.to(cursor, {
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 107, 53, 0.15)',
            border: '1.5px solid #FF6B35',
            borderRadius: '50%',
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          const span = cursor.querySelector('span');
          if (span) {
            span.style.opacity = '0';
            span.style.display = 'none';
          }
        }
      } else {
        if (currentCursorType !== 'default') {
          currentCursorType = 'default';
          gsap.to(cursor, {
            width: 10,
            height: 10,
            backgroundColor: '#FF6B35',
            border: 'none',
            borderRadius: '50%',
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          const span = cursor.querySelector('span');
          if (span) {
            span.style.opacity = '0';
            span.style.display = 'none';
          }
        }
      }
    };

    window.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-cursor-view-text {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
      <div 
        ref={cursorRef} 
        className="fixed pointer-events-none z-[9999] hidden md:flex items-center justify-center text-white text-[10px] font-bold tracking-widest overflow-hidden rounded-full w-2.5 h-2.5 bg-coral"
      >
        <span className="custom-cursor-view-text opacity-0 hidden" style={{ transition: 'opacity 0.2s ease' }}>
          VIEW
        </span>
      </div>
    </>
  );
}
