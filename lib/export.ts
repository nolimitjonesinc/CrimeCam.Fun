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
    // Enforce a concise single-sentence frame section
    if (title === "What's in the Frame?") {
      content = limitToOneSentence(content, 35);
    }
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
}): Promise<Blob> {
  const { src, caseId, report, filter, useShortText, titleOverride } = opts;

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
  const sectionTitleSize = 34;
  const bodySize = 30;
  const titleLH = 48;
  const sectionTitleLH = 42;
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
    lines: wrapText(ctx, s.content, innerW, bodyLH)
  }));
  const totalTextLines = sectionBlocks.reduce((acc, b) => acc + b.lines.length, 0) + sectionBlocks.length; // +1 for each section title

  // Choose image size factor based on text length
  let imgWidthFactor = 0.6; // 60% of inner width by default
  if (totalTextLines > 70) imgWidthFactor = 0.45; // make image smaller for very long text
  const imgW = Math.round(innerW * imgWidthFactor);
  const imgScale = imgW / img.width;
  const imgH = Math.round(img.height * imgScale);

  const title = `CASE #${caseId} — ${titleOverride || 'Crime Scene Report'}`;

  // Compute height: padding + title + gap + image + gap + text + padding
  const gap = 24;
  // Text height includes section titles and their wrapped lines, with small section spacing
  const sectionGap = 12;
  const textHeight = sectionBlocks.reduce((h, b) => h + sectionTitleLH + b.lines.length * bodyLH + sectionGap, 0);
  const subtitleH = parsed.subtitle ? bodyLH : 0;
  const H = pad + titleLH + (subtitleH ? gap / 2 + subtitleH : 0) + gap + imgH + gap + textHeight + pad;

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

  // Optional subtitle extracted from AI's heading
  let y = pad + titleLH;
  if (parsed.subtitle) {
    y += gap / 2;
    ctx.font = `500 ${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
    ctx.fillStyle = '#cfcfcf';
    ctx.fillText(parsed.subtitle, pad, y + bodyLH);
    y += bodyLH;
  }

  // Image (with filter if any)
  const imgY = y + gap;
  // Canvas 2d supports CSS-style filters in modern browsers
  if (filter === 'noir') ctx.filter = 'grayscale(100%) contrast(120%) brightness(90%)';
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
    ctx.font = `700 ${sectionTitleSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
    ctx.fillStyle = '#f3f4f6';
    textY += sectionTitleLH;
    ctx.fillText(block.title, pad, textY);

    // Section body
    ctx.font = `${bodySize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans`;
    ctx.fillStyle = '#d4d4d4';
    for (const line of block.lines) {
      textY += bodyLH;
      ctx.fillText(line, pad, textY);
    }
    textY += sectionGap; // extra spacing between sections
  }

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
  if (!blob) throw new Error('Export failed');
  return blob;
}
