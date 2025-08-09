# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crime Scene Fun - A Next.js application that analyzes user photos with sarcastic detective commentary, treating every image as a suspicious crime scene.

## Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
npm start        # Start production server
```

## Architecture

### Core Stack
- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS v4 alpha** for styling
- **Framer Motion** for animations
- **OpenAI GPT-4 Vision API** for image analysis

### Key Components

1. **Frontend Flow** (`app/page.tsx`):
   - Image upload/capture interface
   - Base64 conversion before API submission
   - Animated state transitions between upload/analysis/results
   - Share functionality with native share API fallback

2. **API Route** (`app/api/analyze/route.ts`):
   - Currently returns mock detective reports
   - Prepared for OpenAI integration (needs implementation)

3. **OpenAI Integration** (`lib/openai.ts`):
   - Detective persona system prompt configured
   - `analyzeImage()` function ready but not yet connected to API route
   - Uses GPT-4o-mini model for cost efficiency

### Environment Configuration

Required in `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key
```

### Path Aliases
- `@/*` maps to root directory (configured in tsconfig.json)

## Implementation Status

- ✅ UI and interactions complete
- ✅ OpenAI library setup complete  
- ⚠️ API route currently using mock data
- TODO: Connect `analyzeImage()` function to API route
- TODO: Add error handling for OpenAI API failures
- TODO: Implement rate limiting
- TODO: Add image size/type validation

## Detective AI Persona Rules

The AI detective must:
- Treat everything as suspicious crime scene evidence
- Use crime terminology for mundane objects
- Maintain dry wit and burned-out detective personality
- Never use emojis
- Format responses as EVIDENCE LOG + DETECTIVE NOTES