import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { StoredReport } from '@/lib/storage';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const {
      imageBase64,
      report,
      caseId,
      mode,
      spice,
      context,
      telemetry,
    } = await req.json();

    if (!imageBase64 || !report || !caseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload image to Vercel Blob
    const blob = await put(`reports/${caseId}.jpg`, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    // Create stored report object
    const storedReport: StoredReport = {
      id: caseId,
      imageUrl: blob.url,
      report,
      caseId,
      mode,
      spice,
      context,
      createdAt: Date.now(),
      telemetry,
    };

    // Save to Vercel KV with 90-day expiration (can be changed to permanent)
    const expirationSeconds = 90 * 24 * 60 * 60; // 90 days
    await kv.set(`report:${caseId}`, JSON.stringify(storedReport), {
      ex: expirationSeconds,
    });

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || 'https://crimescene.fun';
    const shareUrl = `${baseUrl}/report/${caseId}`;

    return NextResponse.json({
      success: true,
      reportId: caseId,
      shareUrl,
      imageUrl: blob.url,
    });
  } catch (error: any) {
    console.error('Error saving report:', error);
    return NextResponse.json({
      error: `Failed to save report: ${error.message}`,
    }, { status: 500 });
  }
}
