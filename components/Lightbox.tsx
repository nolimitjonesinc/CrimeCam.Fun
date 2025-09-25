'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Lightbox({ open, onClose, src, alt }: { open: boolean; onClose: () => void; src: string; alt?: string }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => { if (!open) setZoomed(false); }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.img
            src={src}
            alt={alt || 'Image preview'}
            className={`max-h-[90vh] max-w-[95vw] rounded-xl border border-crime-border shadow-crime ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140 }}
            onClick={(e) => { e.stopPropagation(); setZoomed(z => !z); }}
            style={{ transform: zoomed ? 'scale(1.4)' : undefined, transition: 'transform 200ms ease' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

