import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
