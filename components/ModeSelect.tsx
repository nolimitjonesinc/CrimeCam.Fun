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
    <div className="relative h-9 w-14 rounded-md overflow-hidden ring-1 ring-black/25 flex-shrink-0">
      <div className={`absolute inset-0 ${style ? "" : "bg-gradient-to-r"} ${!style ? gradientClass[id] : ""}`} style={style} />
      {/* Faux content lines for a more realistic preview */}
      <div className="absolute inset-0 p-1.5 flex flex-col justify-end gap-1">
        <div className="h-1.5 rounded bg-white/70" />
        <div className="h-1 rounded bg-white/50 w-3/4" />
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
          className="absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-xl border border-crime-border bg-black/80 backdrop-blur-xl shadow-crime"
          role="listbox"
          tabIndex={-1}
        >
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
                  <div className="text-neutral-100 font-medium leading-none">{p.label}</div>
                  <div className="text-xs text-neutral-400 leading-tight">{p.exportTitle}</div>
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
      )}
    </div>
  );
}
