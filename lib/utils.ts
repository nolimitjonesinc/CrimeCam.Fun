export function generateCaseNumber() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${rand}`;
}

export function isHEICFile(file: File): boolean {
  const t = (file.type || '').toLowerCase();
  const n = (file.name || '').toLowerCase();
  // Common desktop/browser variants
  const mimeMatch = (
    t === 'image/heic' ||
    t === 'image/heif' ||
    t === 'image/heic-sequence' ||
    t === 'image/heif-sequence' ||
    t === 'application/heic' ||
    t === 'application/heif'
  );
  const extMatch = n.endsWith('.heic') || n.endsWith('.heif');
  return mimeMatch || extMatch;
}

export async function convertHEICToJPEG(file: File): Promise<File> {
  const base = (file.name || 'image').replace(/\.(heic|heif)$/i, '') || 'image';
  console.log('🔄 [HEIC] Starting conversion for:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

  // 1) Try native decode (Safari can decode HEIC natively)
  try {
    console.log('🔄 [HEIC] Attempting native browser decode...');
    const bitmap = await createImageBitmap(file);
    console.log('✅ [HEIC] Native decode successful! Dimensions:', bitmap.width, 'x', bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas ctx missing');
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.9)
    );
    console.log('✅ [HEIC] Converted to JPEG:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } catch (nativeErr) {
    console.log('⚠️ [HEIC] Native decode failed (expected on Chrome):', nativeErr);

    // 2) Try libheif-js (modern WASM decoder, better support for newer HEIC formats)
    try {
      console.log('🔄 [HEIC] Trying libheif-js library (modern decoder)...');
      const libheif = await import('libheif-js');
      const arrayBuffer = await file.arrayBuffer();
      const decoder = await libheif.HeifDecoder.create();
      const data = decoder.decode(new Uint8Array(arrayBuffer));
      if (!data || data.length === 0) throw new Error('libheif decode returned no data');

      const image = data[0];
      const width = image.get_width();
      const height = image.get_height();
      console.log('✅ [HEIC] libheif decoded successfully! Dimensions:', width, 'x', height);

      const imageData = await new Promise<ImageData>((resolve, reject) => {
        image.display({ data: new Uint8ClampedArray(width * height * 4), width, height }, (displayData: any) => {
          if (!displayData) reject(new Error('libheif display failed'));
          resolve(new ImageData(displayData.data, displayData.width, displayData.height));
        });
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas ctx missing');
      ctx.putImageData(imageData, 0, 0);

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.9)
      );
      console.log('✅ [HEIC] libheif conversion successful! JPEG size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
      return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
    } catch (libheifErr) {
      console.log('⚠️ [HEIC] libheif-js failed:', libheifErr);

      // 3) Final fallback to heic2any (older but sometimes works)
      try {
        console.log('🔄 [HEIC] Final fallback to heic2any library...');
        const { default: heic2any } = await import('heic2any');
        console.log('✅ [HEIC] heic2any library loaded, converting...');
        const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        const jpegBlob = Array.isArray(result) ? result[0] : result;
        console.log('✅ [HEIC] Conversion successful! JPEG size:', (jpegBlob.size / 1024 / 1024).toFixed(2), 'MB');
        return new File([jpegBlob], `${base}.jpg`, { type: 'image/jpeg' });
      } catch (heic2anyErr) {
        console.error('❌ [HEIC] All conversion methods failed!');
        console.error('Native error:', nativeErr);
        console.error('libheif error:', libheifErr);
        console.error('heic2any error:', heic2anyErr);
        throw new Error(`HEIC conversion failed. This browser doesn't support HEIC files. Please use Safari or convert to JPG/PNG first.`);
      }
    }
  }
}


export async function fileToBase64(file: File): Promise<string> {
  const arr = await file.arrayBuffer();
  const bytes = new Uint8Array(arr);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  const base64 = btoa(binary);
  return `data:${file.type || 'image/jpeg'};base64,${base64}`;
}

// Safari-safe fallback: use HTMLCanvasElement if OffscreenCanvas is unavailable
export async function compressImage(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, w, h);
      const blob = await c.convertToBlob({ type: 'image/jpeg', quality });
      return new File([blob], (file.name || 'image') + '.jpg', { type: 'image/jpeg' });
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) return file;
  ctx2.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', quality));
  return new File([blob], (file.name || 'image') + '.jpg', { type: 'image/jpeg' });
}


export async function applyFilterToImageForAI(file: File, filter: 'none' | 'noir' | 'sepia'): Promise<File> {
  if (filter === 'none') return file;
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width; const h = bitmap.height;
  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext('2d');
    if (!ctx) return file;
    ctx.filter = filter === 'noir' ? 'grayscale(1) contrast(1.2) brightness(0.9)' : 'sepia(1) contrast(1.1)';
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await c.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
    return new File([blob], (file.name || 'image') + '.jpg', { type: 'image/jpeg' });
  }
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) return file;
  (ctx2 as any).filter = filter === 'noir' ? 'grayscale(1) contrast(1.2) brightness(0.9)' : 'sepia(1) contrast(1.1)';
  ctx2.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.9));
  return new File([blob], (file.name || 'image') + '.jpg', { type: 'image/jpeg' });
}
