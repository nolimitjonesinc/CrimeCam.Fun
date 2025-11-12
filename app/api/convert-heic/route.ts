import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    console.log('🔄 [SERVER] Converting HEIC, input size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');

    // Convert HEIC to JPEG using sharp (supports modern HEIC formats)
    const jpegBuffer = await sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log('✅ [SERVER] HEIC converted to JPEG, output size:', (jpegBuffer.length / 1024 / 1024).toFixed(2), 'MB');

    // Return as base64
    const jpegBase64 = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageBase64: jpegBase64,
      originalSize: buffer.length,
      convertedSize: jpegBuffer.length
    });

  } catch (error: any) {
    console.error('❌ [SERVER] HEIC conversion failed:', error);
    return NextResponse.json({
      error: 'HEIC conversion failed',
      details: error.message
    }, { status: 500 });
  }
}
