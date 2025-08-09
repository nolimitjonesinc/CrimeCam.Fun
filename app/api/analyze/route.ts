import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithPersona } from '@/lib/openai';

export const runtime = 'nodejs';

// naive in-memory rate limiter (per IP)
const windows: Record<string, number[]> = {};
function allow(ip: string, max = 12, intervalMs = 60_000) {
  const now = Date.now();
  windows[ip] = (windows[ip] ?? []).filter((t) => now - t < intervalMs);
  if (windows[ip].length >= max) return false;
  windows[ip].push(now);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
    if (!allow(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'Missing image' }, { status: 400 });

    const result = await analyzeImageWithPersona(imageBase64);
    return NextResponse.json(result);
  } catch (e: any) {
    const mockReport = `Crime Scene Report – The Case of the Overworked Workspace

Subject:
This cluttered desk appears to be the epicenter of a slow-motion productivity crime. A tragic tale of deadlines, caffeine dependency, and the kind of organizational chaos that would make Marie Kondo file a restraining order.

Whose Desk Is This?
Meet our prime suspect: a mid-level office worker caught between ambition and reality.

Profile:

Drinks coffee like it's a performance-enhancing drug

Has sticky notes that qualify as archaeological evidence  

Keyboard shows signs of emotional abuse from aggressive typing

What Might Have Happened Here?
This workspace suggests a classic case of "deadline panic disorder" combined with chronic procrastination syndrome. The suspect likely attempted to organize their life multiple times, only to surrender to the chaos and embrace their new identity as a professional fire-fighter of crises.

Notable clues:

Coffee ring – perfectly round, suggesting ritualistic consumption patterns

Keyboard debris – more DNA than a crime lab, indicates frequent stress-eating sessions

Random cables – tangled like the suspect's work-life balance

Stack of papers – arranged in what experts call "aggressive procrastination formation"

Most Damning Clue:
The coffee mug placement suggests this individual has given up on coasters, civilization, and probably hope itself.

How Might This Help Us Solve the Crime?
Cross-reference with missing deadlines, abandoned gym memberships, and a browser history full of "productivity hacks that actually work." This desk is a cry for help disguised as a workspace.

Final Notes:
Filed under: "Suspiciously Relatable" – Office Edition. A Netflix documentary waiting to happen, titled "Cluttered: The Desk That Time Forgot."`;
    
    return NextResponse.json({ report: mockReport }, { status: 200 });
  }
}