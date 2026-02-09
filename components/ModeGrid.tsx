'use client';
import { PRESETS, type PresetId } from '@/lib/presets';
import { gradientClass, getSwatchStyle } from './mode-shared';
import type { SeasonalTheme } from '@/lib/seasons';

type Props = {
  value: PresetId;
  onChange: (id: PresetId) => void;
  season: SeasonalTheme;
};

export function ModeGrid({ value, onChange, season }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-center text-lg font-semibold text-neutral-300 mb-4">All Evidence Types</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESETS.map((p) => {
          const isActive = p.id === value;
          const isFeatured = p.id === season.featuredMode;
          const style = getSwatchStyle(p.id);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`relative text-left rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                isActive
                  ? 'border-[var(--season-accent)] bg-[var(--season-surface)]'
                  : 'border-[var(--season-border,#232326)] bg-[var(--season-surface,#121214)] hover:border-neutral-600'
              }`}
              style={isActive ? { borderColor: 'var(--season-accent, #ef4444)', boxShadow: `0 0 16px var(--season-accent-glow, rgba(239,68,68,0.2))` } : undefined}
            >
              {isFeatured && (
                <span
                  className="absolute -top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: 'var(--season-accent, #ef4444)' }}
                >
                  FEATURED
                </span>
              )}
              <div className="flex items-start gap-3">
                {/* Gradient swatch */}
                <div className="relative h-10 w-10 rounded-lg overflow-hidden ring-1 ring-black/25 flex-shrink-0 flex items-center justify-center">
                  <div className={`absolute inset-0 ${style ? '' : 'bg-gradient-to-r'} ${!style ? gradientClass[p.id] : ''}`} style={style} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neutral-100 truncate">{p.label}</div>
                  <div className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{p.shortDesc || p.exportTitle}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
