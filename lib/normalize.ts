/**
 * Normalize AI report sections:
 * - Enforce one-sentence, ≤35-word "What's in the Frame?".
 * - Remove verbatim repeats of the frame sentence in later sections.
 * - Preserve original headers and order.
 */
export function normalizeReport(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;

  const headerRegex = /(Crime Scene:|What'?s in the Frame\?|Who'?s in the Frame\?|What Might Have Happened Here:|How This Helps Solve the Crime:|Verdict:)/gi;

  // Find headers with their indices
  const matches: { titleRaw: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(raw)) !== null) {
    matches.push({ titleRaw: m[1], index: m.index });
  }
  if (!matches.length) return raw;

  type Block = { header: string; content: string };
  const blocks: Block[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const header = cur.titleRaw; // keep original casing/punctuation
    const start = cur.index + header.length;
    const end = next ? next.index : raw.length;
    const content = raw.slice(start, end).trim();
    blocks.push({ header, content });
  }

  // Locate frame section variant
  const frameIdx = blocks.findIndex(b => /what'?s in the frame\?/i.test(b.header) || /who'?s in the frame\?/i.test(b.header));
  if (frameIdx !== -1) {
    const frame = blocks[frameIdx];
    const oneSentence = firstSentence(frame.content);
    const limited = limitWords(oneSentence, 35);
    // Update frame content
    blocks[frameIdx] = { ...frame, content: limited };

    // Remove verbatim repeats of the limited sentence in later sections
    const needle = normalizeSpace(limited);
    for (let i = 0; i < blocks.length; i++) {
      if (i === frameIdx) continue;
      const c = blocks[i].content;
      const replaced = removeVerbatim(c, needle);
      blocks[i].content = replaced.trim();
    }
  }

  // Rebuild string keeping the original header tokens
  const rebuilt = blocks
    .map(b => `${b.header} ${b.content}`)
    .join('\n');
  return rebuilt;
}

function firstSentence(text: string): string {
  const match = text.match(/^[\s\S]*?[\.!?](?:\s|$)/);
  if (match) return match[0].trim();
  return text.trim();
}

function limitWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

function normalizeSpace(s: string): string {
  return s.replace(/[\s\u00A0]+/g, ' ').trim();
}

function removeVerbatim(haystack: string, needleNorm: string): string {
  if (!needleNorm) return haystack;
  const hayNorm = normalizeSpace(haystack);
  // If the normalized haystack contains the normalized needle, try to remove the raw segment
  if (!hayNorm.toLowerCase().includes(needleNorm.toLowerCase())) return haystack;
  // Remove case-insensitive exact substring occurrences
  const pattern = new RegExp(escapeRegExp(needleNorm), 'i');
  const rawNeedle = (haystack.match(pattern) || [])[0];
  if (!rawNeedle) return haystack;
  return haystack.replace(rawNeedle, '').replace(/\s{2,}/g, ' ');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

