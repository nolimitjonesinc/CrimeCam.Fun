import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CRIMECAM.FUN — THE CRIME-ISH UNIT
 * Cinematic Splash v2 — "Cold Open"
 * Duration: ~2.2s by default (snappy, cinematic, funny)
 * Vibe: noir + cop lights + flashlight reveals + rubber glove snap + stamp
 *
 * How it plays (super fast):
 * 0.00s — Black. Low hum. Police light sweep begins.
 * 0.20s — Flashlight cone reveals quick prop #1 (donut in bag) for 250ms.
 * 0.60s — Flashlight whip-pan reveals prop #2 (rubber chicken) 200ms.
 * 0.90s — Flashlight swing reveals prop #3 (evidence tag on stapler) 200ms.
 * 1.20s — Rubber glove snaps into frame (comedic). Title pre-text enters.
 * 1.45s — Big red OFFICIAL STAMP slams: "THE CRIME-ISH UNIT".
 * 2.20s — Stamp shrinks to header bar; children UI fades in.
 *
 * Notes:
 * - Uses Tailwind + Framer Motion (no image assets).
 * - Keep it fast. All gags must read instantly.
 * - Optional props: `durationMs`, `onDone` callback, `skipIfSeen`.
 */

export default function ColdOpenSplash({
  children,
  durationMs = 2200,
  skipIfSeen = false,
  onDone,
}: {
  children?: React.ReactNode;
  durationMs?: number;
  skipIfSeen?: boolean;
  onDone?: () => void;
}) {
  const [done, setDone] = useState(false);
  const seenKey = "crimecam_seen_splash_v2";

  useEffect(() => {
    if (skipIfSeen && localStorage.getItem(seenKey)) {
      setDone(true);
      onDone?.();
    } else {
      const t = setTimeout(() => {
        localStorage.setItem(seenKey, "1");
        setDone(true);
        onDone?.();
      }, durationMs);
      return () => clearTimeout(t);
    }
  }, [durationMs, onDone, skipIfSeen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !done) {
        localStorage.setItem(seenKey, "1");
        setDone(true);
        onDone?.();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [done, onDone]);

  return (
    <div className="relative h-dvh w-full overflow-auto bg-black text-white">
      <AnimatePresence>{!done && <ColdOpen onSkip={() => { localStorage.setItem(seenKey, "1"); setDone(true); onDone?.(); }} />}</AnimatePresence>

      {/* REVEALED APP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 flex flex-col"
      >
        <HeaderBar collapsed={done} />
        <main className="mx-auto w-full max-w-7xl px-4 py-8">{children ?? <PlaceholderUpload />}</main>
      </motion.div>
    </div>
  );
}

function ColdOpen({ onSkip }: { onSkip?: () => void }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Noir grain + vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.9))]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]; [background-size:22px_22px,22px_22px]" />

      {/* Cop light sweeps (red/blue bar reflections) */}
      <PoliceSweep />

      {/* Flashlight cone + quick prop reveals */}
      <FlashlightSequence />

      {/* Rubber glove snap and stamp */}
      <RubberGloveAndStamp />

      {/* Skip intro */}
      <div className="absolute right-3 top-3 z-40">
        <button onClick={onSkip} className="btn btn-ghost px-3 py-2 text-xs">Skip intro</button>
      </div>

      <style>{keyframes}</style>
    </motion.div>
  );
}

function PoliceSweep() {
  return (
    <>
      <div className="pointer-events-none absolute -inset-20 -skew-x-6 animate-sweep-left bg-gradient-to-r from-blue-600/0 via-blue-500/20 to-blue-600/0" />
      <div className="pointer-events-none absolute -inset-20 skew-x-6 animate-sweep-right bg-gradient-to-l from-red-600/0 via-red-500/20 to-red-600/0" />
    </>
  );
}

function FlashlightSequence() {
  return (
    <div className="absolute inset-0">
      {/* Flashlight cone */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.55) 14%, rgba(255,255,255,0.25) 26%, rgba(0,0,0,0) 55%)",
          filter: "blur(4px)",
          mixBlendMode: "screen",
        }}
        initial={{ scale: 0.2, x: -240, y: -90, opacity: 0 }}
        animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: 0.08 }}
      />

      {/* Prop 1: donut in evidence bag */}
      <PropReveal
        delay={0.2}
        label="EVIDENCE: DONUT"
        svg={<DonutBag className="h-16 w-16 text-pink-300" />}
        pos="left"
      />

      {/* Prop 2: rubber chicken */}
      <PropReveal
        delay={0.58}
        label="EXHIBIT A: RUBBER CHICKEN"
        svg={<Chicken className="h-16 w-16 text-yellow-300" />}
        pos="right"
      />

      {/* Prop 3: stapler with tag */}
      <PropReveal
        delay={0.9}
        label="ITEM 302: SUSPICIOUS STAPLER"
        svg={<TagStapler className="h-16 w-16 text-emerald-300" />}
        pos="bottom"
      />
    </div>
  );
}

function PropReveal({
  delay,
  label,
  svg,
  pos = "left",
}: {
  delay: number;
  label: string;
  svg: React.ReactNode;
  pos?: "left" | "right" | "bottom";
}) {
  const posMap = {
    left: "items-center justify-start pl-10",
    right: "items-center justify-end pr-10",
    bottom: "items-end justify-center pb-14",
  } as const;

  return (
    <motion.div
      className={`absolute inset-0 flex ${posMap[pos]}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14, delay }}
    >
      <motion.div
        className="flex flex-col items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-lg"
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.18, delay }}
      >
        <div>{svg}</div>
        <div className="rounded bg-yellow-300 px-2 py-0.5 text-[10px] font-black tracking-wider text-black">
          {label}
        </div>
      </motion.div>
    </motion.div>
  );
}

function RubberGloveAndStamp() {
  return (
    <>
      {/* Glove enter */}
      <motion.div
        className="absolute right-6 top-1/2 z-20 -translate-y-1/2"
        initial={{ x: 220, rotate: 12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.18, ease: "backOut" }}
      >
        <Glove className="h-24 w-24 text-cyan-300 drop-shadow-[0_10px_20px_rgba(0,255,255,.25)]" />
        <motion.div
          className="mt-1 text-center text-[10px] uppercase tracking-widest text-cyan-200/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.28, duration: 0.08 }}
        >
          *snap*
        </motion.div>
      </motion.div>

      {/* Stamp slam */}
      <motion.div
        className="absolute inset-0 z-30 flex items-center justify-center"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.45, duration: 0.08 }}
      >
        <motion.div
          className="relative select-none rounded-sm border-4 border-red-600/85 bg-gradient-to-b from-red-600/20 to-red-900/10 px-6 py-3 font-extrabold tracking-widest text-red-400 shadow-[0_0_0_2px_rgba(0,0,0,0.45)] [text-shadow:0_2px_0_rgba(0,0,0,0.45)]"
          initial={{ y: -80, rotate: -6 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 700, damping: 20, delay: 1.47 }}
        >
          CRIMECAM.FUN — THE CRIME-ISH UNIT
          {/* impact ring */}
          <motion.span
            className="pointer-events-none absolute -inset-8 rounded-full border border-red-500/40"
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.35, delay: 1.5 }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}

function HeaderBar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="z-10 w-full">
      <div className="crime-tape">
        <div className="crime-tape-overlay">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:py-6 relative">
            {/* Mobile layout: logo small, nudged left; brand centered */}
            <div className="sm:hidden relative">
              <img
                src="/crimecam-icon.jpg"
                alt="CrimeCam.Fun"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border-2 border-black/30 object-cover shadow"
              />
              <div className="text-center">
                <div className="text-4xl font-extrabold tracking-tight leading-tight">CrimeCam.Fun</div>
                <div className="mt-0.5 text-yellow-200 text-xl font-semibold tracking-wide [text-shadow:0_1px_0_rgba(0,0,0,0.55)]">
                  The Crime‑ish Unit
                </div>
              </div>
            </div>
            {/* Desktop layout: 3-col grid keeps brand truly centered */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center">
                  <img
                    src="/crimecam-icon.jpg"
                    alt="CrimeCam.Fun"
                    className="h-24 w-24 md:h-28 md:w-28 rounded-full border-2 border-black/30 object-cover shadow"
                  />
                </div>
                <div className="text-center">
                  <div className="text-6xl font-extrabold tracking-tight leading-tight">CrimeCam.Fun</div>
                  <div className="mt-1 text-yellow-200 text-3xl font-semibold tracking-wide [text-shadow:0_1px_0_rgba(0,0,0,0.55)]">
                    The Crime‑ish Unit
                  </div>
                </div>
                <div />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderUpload() {
  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/90 shadow-lg">
      <h2 className="text-xl font-bold">Submit Your Evidence*</h2>
      <p className="-mt-2 text-sm text-white/60">*legally not evidence, emotionally incriminating</p>
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-xl bg-yellow-300 px-4 py-2 font-semibold text-black shadow hover:brightness-95">Use Camera</button>
        <button className="rounded-xl border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10">Choose File</button>
      </div>
      <p className="text-xs text-white/50">The Crime‑ish Unit may overreact. On purpose.</p>
    </div>
  );
}

/* --- Minimal SVGs so no external assets needed --- */
function DonutBag({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="10" y="8" width="44" height="48" rx="4" className="text-white/50" />
      <circle cx="32" cy="36" r="10" className="text-pink-300" fill="currentColor" />
      <circle cx="32" cy="36" r="4" className="text-black" fill="currentColor" />
      <path d="M14 16h36" />
    </svg>
  );
}
function Chicken({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M18 34c0-10 8-18 19-18 8 0 13 6 13 13 0 14-12 25-26 25-6 0-9-3-9-8 0-6 3-9 7-12z" />
      <circle cx="42" cy="24" r="2" className="text-black" />
      <path d="M48 20l4-4" className="stroke-red-500" strokeWidth="4" stroke="currentColor" />
    </svg>
  );
}
function TagStapler({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="12" y="36" width="36" height="10" rx="3" className="text-white/70" />
      <path d="M12 36l22-10c6-3 10-2 14 2l8 8" className="text-white/70" />
      <rect x="50" y="34" width="10" height="14" rx="2" className="text-yellow-300" fill="currentColor" />
    </svg>
  );
}
function Glove({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M18 30V14c0-3 2-5 5-5s5 2 5 5v11" className="opacity-90" />
      <path d="M28 30V12c0-3 2-5 5-5s5 2 5 5v18" className="opacity-90" />
      <path d="M38 30V14c0-3 2-5 5-5s5 2 5 5v22" className="opacity-90" />
      <path d="M12 32c0 14 8 20 18 20h6c6 0 10-4 10-10V30" className="opacity-90" />
    </svg>
  );
}

const keyframes = `
@keyframes sweep-left { 0%{ transform: translateX(-120%) } 100%{ transform: translateX(120%) } }
@keyframes sweep-right { 0%{ transform: translateX(120%) } 100%{ transform: translateX(-120%) } }
.animate-sweep-left { animation: sweep-left 1.1s ease-out 0s 1; }
.animate-sweep-right { animation: sweep-right 1.1s ease-out .08s 1; }
`;
