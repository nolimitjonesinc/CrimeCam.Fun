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
    const mock = {
      evidenceLog: '• Exhibit A: Coffee ring, radius standard issue.\n• Exhibit B: Keyboard with more DNA than a precinct swab.\n• Exhibit C: An alibi that smells like instant noodles.',
      detectiveNotes: 'The scene reads "overtime without pay." Recommend bagging the mug and questioning whoever calls this organization. Proceed with caution: suspect may be the calendar.'
    };
    return NextResponse.json(mock, { status: 200 });
  }
}