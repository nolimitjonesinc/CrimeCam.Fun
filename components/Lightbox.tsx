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
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.img
            src={src}
            alt={alt || 'Image preview'}
            className={`max-h-[90vh] max-w-[95vw] rounded-2xl border-2 border-neutral-800 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={(e) => { e.stopPropagation(); setZoomed(z => !z); }}
            style={{
              transform: zoomed ? 'scale(1.4)' : undefined,
              transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

