import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, getProviderStatus, type ModelQuality } from '@/lib/providers';
import type { PresetId } from '@/lib/presets';

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

    const { imageBase64, mode, context, spice, quality } = await req.json();
    const modelQuality = (quality as ModelQuality) || 'auto';

    console.log('🔍 [ANALYZE] Mode:', mode, '| Quality:', modelQuality, '| Spice:', spice, '| Image length:', imageBase64?.length || 0, '| Context:', context ? 'provided' : 'none');

    if (!imageBase64) {
      console.log('🔍 [ANALYZE] ERROR: Missing image');
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    // Check provider status
    const providerStatus = getProviderStatus();
    console.log('🔍 [ANALYZE] Provider status:', providerStatus);

    if (!providerStatus.openai && !providerStatus.anthropic) {
      console.log('🔍 [ANALYZE] ERROR: No AI providers configured');
      return NextResponse.json({
        error: 'No AI provider configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to environment.'
      }, { status: 503 });
    }

    console.log('🔍 [ANALYZE] Calling AI provider with quality:', modelQuality);
    const result = await analyzeImage(imageBase64, modelQuality, mode as PresetId, context, spice);

    console.log('🔍 [ANALYZE] Analysis success!');
    console.log('🔍 [ANALYZE] Provider used:', result.telemetry?.provider);
    console.log('🔍 [ANALYZE] Model:', result.telemetry?.model);
    console.log('🔍 [ANALYZE] Duration:', result.telemetry?.durationMs, 'ms');
    console.log('🔍 [ANALYZE] Report length:', result.report?.length || 0);

    if (result.telemetry?.fallbackUsed) {
      console.log('🔍 [ANALYZE] Fallback was used:', result.telemetry.fallbackReason);
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('🔍 [ANALYZE] ERROR:', e);
    console.error('🔍 [ANALYZE] Stack:', e.stack);

    // Check provider status for better error messaging
    const providerStatus = getProviderStatus();

    return NextResponse.json({
      error: `Analysis failed: ${e.message}`,
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined,
      providerStatus
    }, { status: 500 });
  }
}
