import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import ChromaBg from '@/components/ChromaBg';
import SwayAI from '@/components/SwayAI';
import SwaySpaceFloatingLogo from '@/components/SwaySpaceFloatingLogo';
import Tracker from '@/components/Tracker';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'SwayHouse — A Creator Management Agency',
  description: 'SwayHouse is a premium creator management agency in India. We handle brand deals, partnerships, strategy, and growth for selective creators.',
  authors: [{ name: 'SwayHouse' }],
  keywords: ['SwayHouse', 'Sway House', 'Creator Management', 'Influencer Agency India', 'SwaySpace', 'SwayAI', 'SwayHouse Agency', 'Sway House Agency'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'SwayHouse — A Creator Management Agency',
    description: 'SwayHouse is a premium creator management agency in India. We handle brand deals, partnerships, strategy, and growth for selective creators.',
    url: 'https://swayhouse.in',
    siteName: 'SwayHouse',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://swayhouse.in/swayhouse-logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'SwayHouse Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwayHouse — A Creator Management Agency',
    description: 'SwayHouse is a premium creator management agency in India. We handle brand deals, partnerships, strategy, and growth for selective creators.',
    images: ['https://swayhouse.in/swayhouse-logo.jpeg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-inter bg-soft-white text-near-black antialiased relative">
        <div className="noise-bg" />
        <ChromaBg />
        <SwayAI />
        <SwaySpaceFloatingLogo />
        <Tracker />
        {children}
      </body>
    </html>
  );
}
