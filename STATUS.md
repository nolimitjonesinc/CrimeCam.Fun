# CrimeCam.Fun — Status
_Auto-updated by Status Brain on every push. Last change: Added Status Brain workflow for automated status tracking._

**Status:** Live  
**What it is:** A Next.js web app that analyzes photos with sarcastic AI detective commentary in multiple themed modes.  
**Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, OpenAI/Anthropic APIs, Vercel Blob storage.

## What works right now
- Photo upload with camera support
- Server-side HEIC image conversion (via sharp + heic-decode)
- Multi-provider AI analysis (OpenAI GPT, Anthropic Claude) with automatic fallback
- Quality/speed selection (Speed/Balanced/Premium/Auto)
- Spice level control (1-10) for response intensity
- Themed analysis modes: Nice or Naughty List, Warning Label, Group Roast, Cold Open, and seasonal variants
- Dynamic severity verdict bar (red/green) in Nice or Naughty mode
- Seasonal theming with mode grid and example excerpts
- Report sharing via unique URLs
- Cost & performance telemetry (duration, tokens, estimated cost)
- Mobile-optimized responsive design
- Rate limiting on API endpoints
- Local report history via browser storage
- Export functionality

## Recent changes (newest first)
- 2026-07-20 — Added Status Brain workflow and script for automated status reporting
- 2026-02-09 — Redesigned with seasonal theming, mode grid UI, spice dots visualization, and example excerpts
- 2026-01-29 — Set up HQ task tracking (CLAUDE.md + tasks folder)
- 2025-11-13 — Fixed verdict bar logic and added dynamic red/green severity indicator
- 2025-11-12 — Implemented server-side HEIC conversion using sharp library
- 2025-11-12 — Enhanced browser HEIC support with heic-decode and multi-tier fallback
- 2025-11-10 — Added black text backgrounds for Warning Label mode; removed green backgrounds from non-Nice modes
- 2025-11-10 — Separated Subject from Verdict Meter in Nice or Naughty report layout

## Reusable parts (for other projects)
- **Status Brain** — Automated project status file generator that reads git history and code structure — `status-brain.mjs` + `.github/workflows/status-brain.yml`
- **Seasonal theming hook** — React hook for time-based theme switching — `hooks/useSeason.ts`
- **Multi-provider AI fallback** — Abstraction for OpenAI/Anthropic with automatic provider switching — `lib/providers.ts`
- **HEIC conversion utility** — Server-side image format conversion with browser fallback — `app/api/convert-heic/route.ts`
- **Typewriter text animation** — Reusable React component for animated text reveal — `components/TypewriterText.tsx`

## Not done / next
- Task tracking setup exists (CLAUDE.md, tasks/) but most tasks are undefined stubs
- No database layer; reports stored in Vercel KV only
- No authentication/user accounts
- No batch image analysis
- Analytics dashboard not implemented
- Mobile camera permissions handling could be more robust
- Some older config files present (next.config.ts + next.config.mjs — potential conflict)
- Test coverage minimal (only utils.test.ts exists)
