export type ExportFilter = 'none' | 'noir' | 'sepia';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const testLine = line ? line + ' ' + w : w;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function exportCompositeImage(opts: {
  src: string;
  caseId: string;
  report: string;
  filter: ExportFilter;
  useShortText?: boolean;
}): Promise<Blob> {
  const { src, caseId, report, filter, useShortText } = opts;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Failed to load image'));
    // blob: URLs are same-origin; crossOrigin not needed
    i.src = src;
  });

  const W = 1080; // target width
  const pad = 48;
  const innerW = W - pad * 2;

  // Title/body typography
  const titleSize = 40; // px
  const bodySize = 30;
  const titleLH = 48;
  const bodyLH = 40;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');

  ctx.font = `${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  const text = report;
  // Reasonable cap for export; long reports can overflow otherwise
  const cappedText = useShortText ? text.slice(0, 260) : text;
  const wrapped = wrapText(ctx, cappedText, innerW, bodyLH);

  const imgScale = innerW / img.width;
  const imgH = Math.round(img.height * imgScale);

  const title = `CASE #${caseId} — Crime Scene Report`;

  // Compute height: padding + title + gap + image + gap + text + padding
  const gap = 24;
  const H = pad + titleLH + gap + imgH + gap + wrapped.length * bodyLH + pad;

  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  // Card background
  const cardX = pad * 0.5;
  const cardY = pad * 0.5;
  const cardW = W - pad;
  const cardH = H - pad;
  ctx.fillStyle = '#121212';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2);

  // Title
  ctx.fillStyle = '#e5e5e5';
  ctx.font = `600 ${titleSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  ctx.fillText(title, pad, pad + titleLH);

  // Image (with filter if any)
  const imgY = pad + titleLH + gap;
  // Canvas 2d supports CSS-style filters in modern browsers
  if (filter === 'noir') ctx.filter = 'grayscale(100%) contrast(120%) brightness(90%)';
  else if (filter === 'sepia') ctx.filter = 'sepia(100%) contrast(110%)';
  else ctx.filter = 'none';
  ctx.drawImage(img, pad, imgY, innerW, imgH);
  ctx.filter = 'none';

  // Body text
  ctx.font = `${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  ctx.fillStyle = '#d4d4d4';
  const textYStart = imgY + imgH + gap + bodyLH;
  wrapped.forEach((line, idx) => {
    ctx.fillText(line, pad, textYStart + idx * bodyLH);
  });

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
  if (!blob) throw new Error('Export failed');
  return blob;
}

