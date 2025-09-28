export type ExportFilter = 'none' | 'noir' | 'sepia';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // Preserve explicit line breaks (e.g., micro-bullets). Wrap each line independently.
  const paragraphs = String(text).replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) { out.push(''); continue; }
    let line = '';
    for (const w of words) {
      const testLine = line ? line + ' ' + w : w;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        out.push(line);
        line = w;
      } else {
        line = testLine;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

type Section = { title: string; content: string };

function parseReportSections(report: string): { subtitle?: string; sections: Section[] } {
  const sections: Section[] = [];
  const subtitleMatch = report.match(/Crime Scene Report\s+–\s+(.+?)\s+Edition/i);
  const subtitle = subtitleMatch?.[1]?.trim();

  const headerRegex = /(Crime Scene:|What'?s in the Frame\?|Who'?s in the Frame\?|What Might Have Happened Here:|How This Helps Solve the Crime:|Verdict:)/gi;
  const matches: { titleRaw: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(report)) !== null) {
    matches.push({ titleRaw: m[1], index: m.index });
  }

  if (matches.length === 0) {
    // Fallback: single section if we can't parse
    return { subtitle, sections: [{ title: 'Report', content: report.trim() }] };
  }

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const start = cur.index + cur.titleRaw.length;
    const end = next ? next.index : report.length;
    const rawTitle = cur.titleRaw.toLowerCase();
    let title = 'Section';
    if (/crime scene:/.test(rawTitle)) title = 'Crime Scene';
    else if (/(what|who)'?s in the frame\?/.test(rawTitle)) title = "What's in the Frame?";
    else if (/what might have happened here:/.test(rawTitle)) title = 'What Might Have Happened Here';
    else if (/how this helps solve the crime:/.test(rawTitle)) title = 'How This Helps Solve the Crime';
    else if (/verdict:/.test(rawTitle)) title = 'Verdict';
    let content = report.slice(start, end).trim();
    sections.push({ title, content });
  }
  return { subtitle, sections };
}

function limitToOneSentence(text: string, maxWords: number): string {
  const sentMatch = text.match(/^[\s\S]*?[\.!?](?:\s|$)/);
  const sentence = (sentMatch ? sentMatch[0] : text).trim();
  const words = sentence.split(/\s+/);
  if (words.length <= maxWords) return sentence;
  return words.slice(0, maxWords).join(' ') + '…';
}

export async function exportCompositeImage(opts: {
  src: string;
  caseId: string;
  report: string;
  filter: ExportFilter;
  useShortText?: boolean;
  titleOverride?: string;
  format?: 'png' | 'jpeg';
}): Promise<Blob> {
  const { src, caseId, report, filter, useShortText, titleOverride, format = 'png' } = opts;

  function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to load image'));
      i.src = url;
    });
  }

  const img = await loadImage(src);
  let logo: HTMLImageElement | null = null;
  try { logo = await loadImage('/crimecam-icon.jpg'); } catch {}

  const W = 1080; // target width (portrait)
  const pad = 64; // paper margin
  const innerW = W - pad * 2;

  // Title/body typography
  const titleSize = 42; // px
  const sectionTitleSize = 36;
  const bodySize = 30;
  const titleLH = 50;
  const sectionTitleLH = 44;
  const bodyLH = 40;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');

  ctx.font = `${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  const text = report;
  // Reasonable cap for export if requested
  const cappedText = useShortText ? text.slice(0, 260) : text;
  const parsed = parseReportSections(cappedText);

  // Pre-measure lines per section
  const sectionBlocks: { title: string; lines: string[] }[] = parsed.sections.map(s => ({
    title: s.title,
    lines: wrapText(ctx, s.content, innerW)
  }));
  const totalTextLines = sectionBlocks.reduce((acc, b) => acc + b.lines.length, 0) + sectionBlocks.length; // +1 for each section title

  // Choose image size factor based on text length (paper layout)
  let imgWidthFactor = 0.7; // 70% of inner width by default
  if (totalTextLines > 70) imgWidthFactor = 0.5; // smaller for very long text
  const imgW = Math.round(innerW * imgWidthFactor);
  const imgScale = imgW / img.width;
  const imgH = Math.round(img.height * imgScale);

  const title = `${titleOverride || 'Crime Scene Report'}`;

  // Compute height: header + gap + image + gap + text + padding
  const gap = 28;
  // Text height includes section titles and their wrapped lines, with small section spacing
  const sectionGap = 12;
  const textHeight = sectionBlocks.reduce((h, b) => h + sectionTitleLH + b.lines.length * bodyLH + sectionGap, 0);
  const subtitleH = parsed.subtitle ? bodyLH : 0;
  const headerH = 140;
  const H = headerH + (subtitleH ? gap / 2 + subtitleH : 0) + gap + imgH + gap + textHeight + pad;

  canvas.width = W;
  canvas.height = H;

  // Paper background
  ctx.fillStyle = '#f8f7f4';
  ctx.fillRect(0, 0, W, H);

  // Header area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, headerH);
  // Header bottom rule
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerH - 1);
  ctx.lineTo(W, headerH - 1);
  ctx.stroke();

  // Logo
  if (logo) {
    const logoSize = 84;
    ctx.drawImage(logo, pad, Math.round((headerH - logoSize) / 2), logoSize, logoSize);
  }

  // Header text: Brand and Case
  ctx.fillStyle = '#111827';
  ctx.font = `800 ${titleSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  ctx.fillText('CRIMECAM.FUN', pad + 100, 56);
  ctx.font = `600 20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('THE CRIME-ISH UNIT', pad + 100, 84);
  ctx.fillStyle = '#111827';
  ctx.font = `600 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  const caseText = `CASE #${caseId}`;
  const caseW = ctx.measureText(caseText).width;
  ctx.fillText(caseText, W - pad - caseW, 56);

  // Subtle stamp
  ctx.save();
  ctx.translate(W - 280, 38);
  ctx.rotate(-0.25);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
  ctx.font = `900 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  ctx.fillText('OFFICIAL REPORT', 0, 0);
  ctx.restore();

  // Title
  ctx.fillStyle = '#e5e5e5';
  ctx.font = `600 ${titleSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
  ctx.fillText(title, pad, pad + titleLH);

  // Optional subtitle extracted from AI's heading
  let y = headerH;
  if (parsed.subtitle) {
    y += gap / 2;
    ctx.font = `600 ${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
    ctx.fillStyle = '#111827';
    ctx.fillText(parsed.subtitle, pad, y + bodyLH);
    y += bodyLH;
  }

  // Image (with filter if any)
  const imgY = y + gap;
  // Canvas 2d supports CSS-style filters in modern browsers
  if (filter === 'noir') ctx.filter = 'grayscale(100%) contrast(115%) brightness(95%)';
  else if (filter === 'sepia') ctx.filter = 'sepia(100%) contrast(110%)';
  else ctx.filter = 'none';
  // Center the smaller image horizontally within content width
  const imgX = pad + Math.round((innerW - imgW) / 2);
  ctx.drawImage(img, imgX, imgY, imgW, imgH);
  ctx.filter = 'none';

  // Body text
  let textY = imgY + imgH + gap;
  for (const block of sectionBlocks) {
    // Section title
    ctx.font = `800 ${sectionTitleSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
    ctx.fillStyle = '#111827';
    textY += sectionTitleLH;
    ctx.fillText(block.title, pad, textY);

    // Section body
    ctx.font = `${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
    ctx.fillStyle = '#1f2937';
    for (const line of block.lines) {
      textY += bodyLH;
      ctx.fillText(line, pad, textY);
    }
    textY += sectionGap; // extra spacing between sections
  }

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.9 : 0.95;
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, quality));
  if (!blob) throw new Error('Export failed');
  return blob;
}
