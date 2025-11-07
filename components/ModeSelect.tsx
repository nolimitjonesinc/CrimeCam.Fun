"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type PresetId } from "@/lib/presets";

type Props = {
  value: PresetId;
  onChange: (id: PresetId) => void;
};

// Lightweight gradient theming per mode.
const gradientClass: Record<PresetId, string> = {
  crime: "from-red-600 to-rose-700",
  trading_card: "from-fuchsia-500 to-pink-500",
  mugshot: "from-amber-600 to-orange-700",
  yearbook: "from-sky-500 to-indigo-500",
  movie_poster: "from-indigo-600 to-fuchsia-600",
  prescription: "from-emerald-500 to-teal-600",
  dating_profile: "from-rose-500 to-pink-600",
  warning_label: "from-yellow-400 to-orange-500",
  amazon_listing: "from-amber-400 to-amber-600",
  elf: "from-red-500 to-green-600", // Special candy-cane handled below as swatch style
  cupid: "from-pink-400 to-rose-600",
  spooky: "from-purple-900 to-orange-600",
  beach_patrol: "from-sky-400 to-cyan-600",
  group_roast: "from-neutral-600 to-neutral-800",
};

// Extra inline styles for unique looks
const swatchStyle = (id: PresetId): React.CSSProperties | undefined => {
  if (id === "elf") {
    // Candy-cane stripes
    return {
      backgroundImage:
        "repeating-linear-gradient(45deg, #ffffff 0, #ffffff 10px, #ef4444 10px, #ef4444 20px)",
    };
  }
  if (id === "warning_label") {
    // Caution stripes
    return {
      backgroundImage:
        "repeating-linear-gradient(45deg, #eab308 0, #eab308 12px, #111827 12px, #111827 24px)",
    };
  }
  return undefined;
};

function Thumb({ id }: { id: PresetId }) {
  const style = swatchStyle(id);
  return (
    <div className="relative h-9 w-14 rounded-md overflow-hidden ring-1 ring-black/25 flex-shrink-0 flex items-center justify-center">
      <div className={`absolute inset-0 ${style ? "" : "bg-gradient-to-r"} ${!style ? gradientClass[id] : ""}`} style={style} />
      <div className="relative z-10 text-white/90">
        <ModeGlyph id={id} className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function ModeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => PRESETS.findIndex(p => p.id === value));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Keep activeIndex synced to value when selection changes externally
  useEffect(() => {
    const idx = PRESETS.findIndex(p => p.id === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function commitSelection(idx: number) {
    const chosen = PRESETS[idx];
    if (!chosen) return;
    onChange(chosen.id as PresetId);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % PRESETS.length);
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + PRESETS.length) % PRESETS.length);
      scrollActiveIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      commitSelection(activeIndex);
    }
  }

  function scrollActiveIntoView() {
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-idx='${activeIndex}']`);
    el?.scrollIntoView({ block: "nearest" });
  }

  const selected = useMemo(() => PRESETS.find(p => p.id === value)!, [value]);

  function ModeGlyph({ id, className }: { id: PresetId; className?: string }) {
    const common = "stroke-current";
    switch (id) {
      case "crime":
        // Badge
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 3l3 2 3-1 1 3 2 2-2 3 1 3-3 1-2 3-3-2-3 2-2-3-3-1 1-3-2-3 2-2 1-3 3 1 3-2z" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "mugshot":
        // Bars
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M4 4h16M4 8h16M4 12h16M4 16h16M4 20h16" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "prescription":
        // Rx
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M6 6h5a3 3 0 010 6H6V6zm0 6l8 8m-2-8l4 4" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "movie_poster":
        // Clapper
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <rect x="3" y="9" width="18" height="12" rx="2" className={common} strokeWidth="1.5" />
            <path d="M3 9l4-5 6 5 4-5 4 5" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "dating_profile":
        // Chat bubble
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M4 6h16v9a3 3 0 01-3 3H9l-5 3 2-3H7a3 3 0 01-3-3V6z" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "warning_label":
        // Triangle
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 3l9 16H3l9-16z" className={common} strokeWidth="1.5" />
            <path d="M12 9v5m0 3h.01" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "amazon_listing":
        // Tag
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M3 12l9-9 9 9-9 9-9-9z" className={common} strokeWidth="1.5" />
            <circle cx="12" cy="8" r="1.5" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "trading_card":
        // Star
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 3l2.7 5.7 6.3.9-4.5 4.4 1 6.2L12 17l-5.5 3.2 1-6.2-4.5-4.4 6.3-.9L12 3z" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "elf":
        // Bell
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 4c-3 0-5 2-5 5v3l-2 3h14l-2-3V9c0-3-2-5-5-5z" className={common} strokeWidth="1.5" />
            <circle cx="12" cy="19" r="1.5" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "spooky":
        // Simple ghost
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M7 18V9a5 5 0 0110 0v9l-2-1-2 1-2-1-2 1-2-1z" className={common} strokeWidth="1.5" />
            <circle cx="10" cy="12" r="1" fill="currentColor" />
            <circle cx="14" cy="12" r="1" fill="currentColor" />
          </svg>
        );
      case "beach_patrol":
        // Lifebuoy
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <circle cx="12" cy="12" r="7" className={common} strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3" className={common} strokeWidth="1.5" />
            <path d="M12 5v4M12 15v4M5 12h4M15 12h4" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "yearbook":
        // Graduation cap
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 3l10 5-10 5L2 8l10-5z" className={common} strokeWidth="1.5" />
            <path d="M6 10v5c0 2 2.5 4 6 4s6-2 6-4v-5" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "cupid":
        // Heart with arrow
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <path d="M12 20l-7-7c-2-2-2-5 0-7s5-2 7 0c2-2 5-2 7 0s2 5 0 7l-7 7z" className={common} strokeWidth="1.5" />
            <path d="M4 4l16 16" className={common} strokeWidth="1.5" />
          </svg>
        );
      case "group_roast":
      default:
        // Circles group
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
            <circle cx="8" cy="12" r="3" className={common} strokeWidth="1.5" />
            <circle cx="16" cy="12" r="3" className={common} strokeWidth="1.5" />
            <circle cx="12" cy="7" r="2.5" className={common} strokeWidth="1.5" />
          </svg>
        );
    }
  }

  function HeroPreview({ id, title }: { id: PresetId; title: string }) {
    const style = swatchStyle(id);
    const preset = PRESETS.find(p => p.id === id);
    return (
      <div className="hidden md:flex flex-col gap-3 p-3">
        <div className="relative h-36 w-full rounded-xl overflow-hidden ring-1 ring-black/25">
          <div className={`absolute inset-0 ${style ? "" : "bg-gradient-to-r"} ${!style ? gradientClass[id] : ""}`} style={style} />
          <div className="absolute inset-0 p-3 flex flex-col">
            <div className="flex-1" />
            <div className="text-sm font-semibold text-white/90 drop-shadow">{title}</div>
            <div className="mt-1 h-1.5 rounded bg-white/70 w-1/2" />
            <div className="mt-1 h-1 rounded bg-white/50 w-2/3" />
          </div>
          <div className="absolute top-3 right-3 text-white/90">
            <ModeGlyph id={id} className="h-10 w-10" />
          </div>
        </div>
        <div className="text-xs text-neutral-300 leading-relaxed">
          {preset?.shortDesc || 'Select a mode to get started.'}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative w-full" onKeyDown={onKeyDown}>
      <button
        type="button"
        className="w-full rounded-xl border border-crime-border bg-crime-surface/80 px-4 py-2.5 text-neutral-100 font-medium flex items-center justify-between gap-3 transition-all hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-crime-red/20"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Thumb id={selected.id} />
          <span className="truncate">{selected.label}</span>
        </div>
        <svg className={`h-5 w-5 transition-transform ${open ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-20 mt-2 w-full md:w-[42rem] rounded-xl border border-crime-border bg-black/80 backdrop-blur-xl shadow-crime overflow-hidden"
          role="listbox"
          tabIndex={-1}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="overflow-auto max-h-80 md:max-h-[22rem]">
              {PRESETS.map((p, idx) => {
                const active = idx === activeIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    data-idx={idx}
                    role="option"
                    aria-selected={p.id === value}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commitSelection(idx)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                      active ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <Thumb id={p.id} />
                    <div className="flex-1">
                  <div className="text-neutral-100 font-medium leading-none flex items-center gap-2">
                    <ModeGlyph id={p.id} className="h-4 w-4 opacity-80" />
                    <span>{p.label}</span>
                  </div>
                  <div className="text-xs text-neutral-400 leading-tight">{(p as any).shortDesc ?? p.exportTitle}</div>
                </div>
                    {p.id === value && (
                      <svg className="h-5 w-5 text-neutral-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 00-1.408-1.42l-6.59 6.538-2.002-2.016a1 1 0 10-1.424 1.404l2.704 2.72a1 1 0 001.416.008l7.304-7.234z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <HeroPreview id={PRESETS[activeIndex]?.id ?? selected.id} title={PRESETS[activeIndex]?.label ?? selected.label} />
          </div>
        </div>
      )}
    </div>
  );
}
