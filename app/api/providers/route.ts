import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/lib/providers';

export const runtime = 'nodejs';

export async function GET() {
  const status = getProviderStatus();
  return NextResponse.json(status);
}