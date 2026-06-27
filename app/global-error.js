'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[SwayHouse Global Error Boundary]', error);

    const reportError = async () => {
      try {
        await fetch('/api/error-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error?.message || String(error),
            stack: error?.stack || '',
            digest: error?.digest || '',
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          }),
        });
      } catch (err) {
        console.error('Failed to report client-side error to server:', err);
      }
    };

    reportError();
  }, [error]);
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#FAFAF9',
        color: '#1A1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%', 
            background: 'rgba(255,107,53,0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 20px', fontSize: '20px' 
          }}>
            ⚠️
          </div>
          <h2 style={{ 
            fontSize: '18px', fontWeight: 700, marginBottom: '8px',
            letterSpacing: '-0.01em' 
          }}>
            Something went wrong
          </h2>
          <p style={{ 
            fontSize: '13px', color: '#888', lineHeight: '1.5', marginBottom: '24px' 
          }}>
            We hit an unexpected error. This has been logged — please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 28px',
              borderRadius: '999px',
              background: '#1A1A1A',
              color: '#fff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <p style={{ fontSize: '10px', color: '#bbb', marginTop: '32px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            SwayHouse
          </p>
        </div>
      </body>
    </html>
  );
}
