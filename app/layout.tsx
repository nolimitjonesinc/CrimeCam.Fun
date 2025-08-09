import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crime Scene - Detective AI Photo Analyzer",
  description: "Analyze your photos with sarcastic detective commentary. Every image becomes a crime scene investigation.",
  metadataBase: new URL('https://crimescene.fun'),
  openGraph: {
    title: 'Crime Scene - Detective AI Photo Analyzer',
    description: 'Every photo tells a suspicious story',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crime Scene - Detective AI Photo Analyzer',
    description: 'Every photo tells a suspicious story',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
