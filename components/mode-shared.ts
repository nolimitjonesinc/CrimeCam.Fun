import type { PresetId } from '@/lib/presets';

export const gradientClass: Record<PresetId, string> = {
  crime: 'from-red-600 to-rose-700',
  trading_card: 'from-fuchsia-500 to-pink-500',
  mugshot: 'from-amber-600 to-orange-700',
  yearbook: 'from-sky-500 to-indigo-500',
  movie_poster: 'from-indigo-600 to-fuchsia-600',
  prescription: 'from-emerald-500 to-teal-600',
  dating_profile: 'from-rose-500 to-pink-600',
  warning_label: 'from-yellow-400 to-orange-500',
  amazon_listing: 'from-amber-400 to-amber-600',
  elf: 'from-red-500 to-green-600',
  cupid: 'from-pink-400 to-rose-600',
  spooky: 'from-purple-900 to-orange-600',
  beach_patrol: 'from-sky-400 to-cyan-600',
  group_roast: 'from-neutral-600 to-neutral-800',
};

export function getSwatchStyle(id: PresetId): React.CSSProperties | undefined {
  if (id === 'elf') {
    return { backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 10px, #ef4444 10px, #ef4444 20px)' };
  }
  if (id === 'warning_label') {
    return { backgroundImage: 'repeating-linear-gradient(45deg, #eab308 0, #eab308 12px, #111827 12px, #111827 24px)' };
  }
  return undefined;
}
