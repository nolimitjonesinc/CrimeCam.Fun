'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ShareModal({ open, onClose, textFull, textShort }: { open: boolean; onClose: () => void; textFull: string; textShort: string }) {
  const [mode, setMode] = useState<'full'|'short'>('full');

  async function doShare() {
    const text = mode === 'full' ? textFull : textShort;
    const shareData = { title: 'CrimeCam.Fun Report', text, url: 'https://crimecam.fun' } as ShareData;
    if (navigator.share) { try { await navigator.share(shareData); onClose(); return; } catch {} }
    try { await navigator.clipboard.writeText(text + '\n\n— Generated on crimecam.fun'); alert('Copied to clipboard'); onClose(); } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 140 }} className="w-full sm:max-w-md bg-crime-surface border border-crime-border rounded-2xl p-5 m-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Share Report</h3>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2"><input type="radio" name="mode" checked={mode==='full'} onChange={()=>setMode('full')} /> Full</label>
              <label className="inline-flex items-center gap-2"><input type="radio" name="mode" checked={mode==='short'} onChange={()=>setMode('short')} /> Short</label>
            </div>
            <p className="text-neutral-400 text-xs mt-2">Full = CASE # + Evidence + Notes (exact). Short ≤260 chars for socials.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button className="btn btn-ghost" onClick={() => { const t = mode==='full'?textFull:textShort; navigator.clipboard.writeText(t); }}>Copy</button>
              <button className="btn btn-primary" onClick={doShare}>Share</button>
            </div>
            <button className="mt-3 text-xs text-neutral-400" onClick={onClose}>Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}