'use client';
import { motion } from 'framer-motion';

export function CrimeTapeHeader() {
  return (
    <div className="mt-6">
      <div className="rounded-2xl overflow-hidden shadow-crime">
        <div className="crime-tape relative">
          <div className="crime-tape-overlay px-4 py-5 sm:px-6">
            <motion.h1 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className="text-2xl font-bold tracking-wide">
              CRIMECAM.FUN — EVIDENCE INTAKE
            </motion.h1>
            <p className="text-neutral-300 mt-1">Upload evidence. Get a snarky report. Try not to tamper with the scene.</p>
          </div>
        </div>
      </div>
    </div>
  );
}