import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Caveat } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });

export const metadata: Metadata = {
  title: 'CrimeCam.Fun — AI Crime Scene Photo Analyzer',
  description: 'Snap a pic. Get a sarcastic detective report. Mobile-first, noir UI.',
  openGraph: {
    title: 'CrimeCam.Fun',
    description: 'Evidence logs for your everyday mess.',
    url: 'https://crimecam.fun',
    siteName: 'CrimeCam.Fun',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'CrimeCam.Fun' }
    ],
    type: 'website'
  },
  themeColor: '#0b0b0c',
  icons: {
    icon: '/crimecam-icon.jpg',
    apple: '/crimecam-icon.jpg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${caveat.variable}`}>
        <div className="min-h-screen">
          <Suspense fallback={<div className="p-8">Loading…</div>}>
            {children}
          </Suspense>
        </div>
        <footer className="text-center text-xs text-neutral-500 py-6 border-t border-crime-border">
          Images are analyzed ephemerally. No storage in V1. © {new Date().getFullYear()} CrimeCam.Fun
        </footer>
      </body>
    </html>
  );
}
