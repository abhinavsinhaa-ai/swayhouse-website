import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import LenisProvider from '@/components/LenisProvider';
import ChromaBg from '@/components/ChromaBg';

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
  title: 'SwayHouse — Creator Management Company',
  description: 'SwayHouse handles brand deals, strategy, and growth for creators who are serious about building a career.',
  openGraph: {
    title: 'SwayHouse — Creator Management Company',
    description: 'SwayHouse handles brand deals, strategy, and growth for creators who are serious about building a career.',
    url: 'https://swayhouse.in',
    siteName: 'SwayHouse',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-inter bg-soft-white text-near-black antialiased relative">
        <div className="noise-bg" />
        <ChromaBg />
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
