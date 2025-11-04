import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithPersona } from '@/lib/openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for OpenAI response

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
  console.log('🔍 [ANALYZE] Request received');

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
    console.log('🔍 [ANALYZE] IP:', ip);

    if (!allow(ip)) {
      console.log('🔍 [ANALYZE] Rate limit exceeded for IP:', ip);
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { imageBase64, mode, context } = await req.json();
    console.log('🔍 [ANALYZE] Mode:', mode, '| Image length:', imageBase64?.length || 0, '| Context:', context ? 'provided' : 'none');

    if (!imageBase64) {
      console.log('🔍 [ANALYZE] ERROR: Missing image');
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    console.log('🔍 [ANALYZE] Calling OpenAI...');
    const result = await analyzeImageWithPersona(imageBase64, mode, context);
    console.log('🔍 [ANALYZE] OpenAI success! Report length:', result.report?.length || 0);

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('🔍 [ANALYZE] ERROR:', e);
    console.error('🔍 [ANALYZE] Stack:', e.stack);
    console.error('🔍 [ANALYZE] OpenAI Key:', OPENAI_API_KEY ? 'present' : 'missing');

    // Send error back to see what's actually failing
    return NextResponse.json({
      error: `OpenAI failed: ${e.message}`,
      stack: e.stack,
      openaiKey: OPENAI_API_KEY ? 'present' : 'missing'
    }, { status: 500 });
  }
}
