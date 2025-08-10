# Crime Scene Fun - Complete Project Context

## Project Overview
A Next.js web application that analyzes user photos with sarcastic detective commentary, treating every image as a suspicious crime scene investigation.

## Tech Stack
- Next.js 14.2.5 with App Router
- TypeScript 5.5.3
- React 18.3.1
- Tailwind CSS 4.0.0-alpha
- Framer Motion 11.3.24
- OpenAI API (GPT-4 Vision)

## Project Structure
```
crimescene.fun/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts      # API endpoint for image analysis
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main page with upload/analysis UI
├── lib/
│   ├── openai.ts            # OpenAI integration and detective prompt
│   └── utils.ts             # Utility functions (base64 conversion)
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── postcss.config.mjs       # PostCSS configuration
└── .env.local               # Environment variables (not in repo)
```

## Core Files

### `package.json`
```json
{
  "name": "crimescene-fun",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.3.24",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0-alpha.19",
    "tailwindcss": "^4.0.0-alpha.19",
    "@types/node": "^20.14.8",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.3",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5",
    "postcss": "^8.4.40"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `app/page.tsx` - Main UI Component
```tsx
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64 } from '@/lib/utils';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setReport(null);

      const base64 = await fileToBase64(file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = () => {
    if (report) {
      const shareText = `${report}\n\nAnalyzed at crimescene.fun`;
      
      if (navigator.share) {
        navigator.share({
          text: shareText,
          title: 'Crime Scene Analysis',
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Report copied to clipboard!');
      }
    }
  };

  const handleNewAnalysis = () => {
    setReport(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-red-500">CRIME SCENE</h1>
          <p className="text-gray-400">Every photo tells a suspicious story</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!report ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="block w-full p-12 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-red-500 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="text-6xl">[ EVIDENCE ]</div>
                    <div>
                      <p className="text-xl font-semibold">Upload Evidence</p>
                      <p className="text-gray-400 text-sm mt-1">Click to select or take a photo</p>
                    </div>
                  </div>
                </label>
              </div>

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                  <p className="mt-4 text-gray-400">Detective analyzing the scene...</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {report}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Share Report
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>No evidence is safe from scrutiny</p>
        </motion.div>
      </div>
    </div>
  );
}
```

### `app/api/analyze/route.ts` - API Endpoint
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Mock detective report for now (replace with OpenAI call)
    const mockReports = [
      "DETECTIVE REPORT #001\n\nWell, well, well... what do we have here? Another 'innocent' photo that's about as subtle as a brick through a window.\n\nEVIDENCE ANALYSIS:\n- Subject appears to be hiding something behind that forced smile\n- Lighting suggests this was taken hastily, probably to cover up something\n- Background shows suspicious activity that would make any detective's eyebrow raise\n\nVERDICT: Highly suspicious. I've seen enough 'candid' photos to know when someone's trying too hard to look natural.\n\nRECOMMENDATION: Keep this one under surveillance. Nobody smiles that much without a reason.",
      
      "DETECTIVE REPORT #002\n\nOh, this is rich. Another 'perfectly normal' photo that screams guilt louder than a car alarm at 3 AM.\n\nCRIME SCENE BREAKDOWN:\n- The composition is too perfect - clearly staged\n- Everyone's trying way too hard to look casual\n- There's definitely something going on just outside the frame\n\nMY PROFESSIONAL OPINION: This photo has more red flags than a communist parade. The subjects are overcompensating harder than a guilty teenager.\n\nSTATUS: Case remains open. This photo raises more questions than it answers.",
      
      "DETECTIVE REPORT #003\n\nGreat, another 'innocent' snapshot that's about as convincing as a three-dollar bill.\n\nFORENSIC FINDINGS:\n- Timing of this photo is suspiciously convenient\n- Body language suggests everyone knows more than they're letting on\n- The setting itself tells a story of barely contained chaos\n\nFINAL ASSESSMENT: This photo is hiding secrets like a teenager hides their browser history. Every pixel screams 'we're up to something.'\n\nNEXT STEPS: Full investigation recommended. Nobody is this photogenic by accident."
    ];

    const randomReport = mockReports[Math.floor(Math.random() * mockReports.length)];

    return NextResponse.json({ report: randomReport });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
```

### `lib/openai.ts` - OpenAI Integration
```typescript
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DETECTIVE_SYSTEM_PROMPT = ``You are a professional crime scene analyzer. I need you to professionally analyze this image and tell me a quick summary of who’s desk this is, what might have happened here and how it might help you solve the crime.  But make it extremely fun, dry and sarcastic with some self deprecating humor for levity. 
Rules:
- Use law-enforcement terminology for mundane objects.
- Never use emojis.
- Format strictly has these sections:
Crime Scene Report – [Custom Scene Title]
Subject:
[One to two sentences summarizing the overall absurdity, aesthetic, or chaos of the scene. Compare it to something overdramatic, like a crime documentary or an action movie scene. Make it sound like there’s a bigger plot at play.]

Whose [Object/Scene] Is This?
[Brief identification of the “suspect” type. Use stereotypes, exaggerated speculation, and humorous guesswork. Include hints about their personality and lifestyle.]

Profile:

[Quirky or incriminating trait #1]

[Quirky or incriminating trait #2]

[Quirky or incriminating trait #3]

What Might Have Happened Here?
[One or two sentences describing the larger “narrative” of events. Suggest possible shady, dramatic, or ridiculous scenarios that could have taken place.]

Notable clues:

[Clue #1 – Describe with humorous suspicion]

[Clue #2 – Describe with sarcastic embellishment]

[Clue #3 – Describe with implied scandal]

[Clue #4 – Add something oddly specific and silly]

Most Damning Clue:
[Identify one central, hilarious “smoking gun” piece of evidence. Frame it as if it’s the key to the whole investigation.]

How Might This Help Us Solve the Crime?
[Explain how these clues could “crack the case” in an exaggerated way. Reference cross-referencing data, interrogations, or ridiculous investigative methods.]

Final Notes:
[Deliver a punchline-level conclusion that puts the scene in a category like “Suspiciously Innocent,” “Definitely Guilty But Pretty About It,” or “A Netflix Docuseries Waiting to Happen.”]
- Max 500 words.`;

export function generateCaseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  
  return `CASE #${year}-${month}-${day}-${time}`;
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: DETECTIVE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this crime scene. Remember: dry wit, crime terminology, no emojis.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    return response.choices[0]?.message?.content || 'Analysis failed. The detective is on a coffee break.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze image');
  }
}
```

### `lib/utils.ts` - Utility Functions
```typescript
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
```

### `app/layout.tsx` - Root Layout
```typescript
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Crime Scene - Detective AI Photo Analyzer",
  description: "Every photo tells a suspicious story",
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
```

### `app/globals.css` - Global Styles
```css
@import 'tailwindcss';

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}
```

## Environment Variables Required
Create a `.env.local` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Current Implementation Status

### Working Features
- ✅ File upload interface with drag-and-drop
- ✅ Mobile camera capture support
- ✅ Animated UI transitions
- ✅ Share functionality (native share API with clipboard fallback)
- ✅ Mock detective reports
- ✅ Error handling for invalid files

### Not Yet Implemented
- ❌ Real OpenAI API integration (code exists but not connected)
- ❌ Rate limiting
- ❌ User authentication
- ❌ Report history/persistence
- ❌ Image size optimization
- ❌ Supabase integration (mentioned in README)

## How to Connect OpenAI Integration

To enable real AI analysis instead of mock reports, modify `app/api/analyze/route.ts`:

```typescript
import { analyzeImage, generateCaseNumber } from '@/lib/openai';

// Replace the mock reports section with:
const caseNumber = generateCaseNumber();
const analysis = await analyzeImage(image);
const report = `${caseNumber}\n\n${analysis}`;

return NextResponse.json({ report });
```

## Detective AI Persona Guidelines

The AI detective character should:
- Treat every photo as a crime scene with suspicious evidence
- Use law enforcement terminology for everyday objects
- Maintain a burned-out, cynical detective personality
- Never use emojis or cheerful language
- Format responses as evidence logs with detective notes
- Keep responses under 500 tokens for performance

## UI/UX Design Principles
- Dark, noir-inspired theme (gray-900 background)
- Red accent color (#ef4444) for CTAs and highlights
- Monospace font for detective reports
- Smooth animations with Framer Motion
- Mobile-first responsive design
- Accessibility considerations (ARIA labels, keyboard navigation)

## Deployment Considerations
- Set environment variables in production
- Configure CORS if API will be accessed externally
- Implement rate limiting before public launch
- Add error tracking (Sentry, etc.)
- Monitor OpenAI API usage and costs
- Consider CDN for static assets