'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Tracker() {
  const pathname = usePathname();
  const lastLoggedPathRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Get or create a persistent anonymous visitor ID
    let visitorId = localStorage.getItem('swayhouse_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('swayhouse_visitor_id', visitorId);
    }

    // 2. Prevent duplicate logging on double-mounts in React strict mode
    const currentPath = pathname;
    if (lastLoggedPathRef.current === currentPath) return;
    lastLoggedPathRef.current = currentPath;

    // 3. Send pageview request to backend API
    const logPageview = async () => {
      try {
        const referrer = document.referrer || 'Direct';
        const userAgent = navigator.userAgent;

        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: visitorId,
            path: currentPath,
            referrer: referrer,
            user_agent: userAgent
          })
        });
      } catch (err) {
        console.error('Failed to log pageview analytics:', err);
      }
    };

    logPageview();
  }, [pathname]);

  return null; // This is a headless analytics component
}
