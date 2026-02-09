'use client';
import { motion } from 'framer-motion';

export function CrimeTapeHeader() {
  return (
    <div className="mt-6">
      <div className="rounded-2xl overflow-hidden shadow-crime">
        <div className="crime-tape relative">
          <div className="crime-tape-overlay px-4 py-5 sm:px-6 flex items-center gap-3">
            <img src="/crimecam-icon.jpg" alt="CrimeCam.Fun" className="h-28 w-28 rounded-md border border-black/20 object-cover" />
            <div className="flex-1 min-w-0">
              <motion.h1 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className="text-2xl font-bold tracking-wide">
                CRIMECAM.FUN
              </motion.h1>
              <p className="text-neutral-400 text-sm mt-1">Upload photo evidence. Get a snarky report.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
