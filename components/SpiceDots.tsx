'use client';

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export function SpiceDots({ value, onChange }: Props) {
  return (
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        Spice Level <span className="text-neutral-500">({value})</span>
      </label>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="group relative h-7 w-7 rounded-full border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            style={{
              borderColor: n <= value ? 'var(--season-accent, #ef4444)' : 'var(--season-border, #232326)',
              backgroundColor: n <= value ? 'var(--season-accent, #ef4444)' : 'transparent',
            }}
            aria-label={`Spice level ${n}`}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'var(--season-accent, #ef4444)', opacity: n <= value ? 0 : undefined }}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-neutral-500 mt-1.5 px-0.5">
        <span>Soft</span>
        <span>Medium</span>
        <span>Feral</span>
      </div>
    </div>
  );
}
