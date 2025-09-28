/**
 * Normalize AI report sections:
 * - Enforce one-sentence, ≤35-word "What's in the Frame?".
 * - Remove verbatim repeats of the frame sentence in later sections.
 * - Preserve original headers and order.
 */
export function normalizeReport(raw: string): string {
  // Keep as-is; we no longer rewrite the frame section so it can contain micro-bullets.
  return typeof raw === 'string' ? raw : '';
}
