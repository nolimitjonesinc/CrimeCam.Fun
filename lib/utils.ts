export function generateCaseNumber() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
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
  // 1) Try native decode (Safari can decode HEIC natively)
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas ctx missing');
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.9)
    );
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } catch (nativeErr) {
    // 2) Fallback to WASM decoder (heic2any)
    try {
      const { default: heic2any } = await import('heic2any');
      const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      const jpegBlob = Array.isArray(result) ? result[0] : result;
      return new File([jpegBlob], `${base}.jpg`, { type: 'image/jpeg' });
    } catch (wasmErr) {
      console.error('HEIC conversion failed (native + wasm):', nativeErr, wasmErr);
      throw new Error('Failed to convert HEIC image on this browser. Try Safari or use a JPG/PNG.');
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
