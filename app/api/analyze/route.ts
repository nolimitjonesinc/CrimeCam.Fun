import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithPersona } from '@/lib/openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
    console.error('OpenAI API Error:', e);
    // Send error back to see what's actually failing
    return NextResponse.json({ 
      error: `OpenAI failed: ${e.message}`,
      stack: e.stack,
      openaiKey: OPENAI_API_KEY ? 'present' : 'missing'
    }, { status: 500 });
  }
}

