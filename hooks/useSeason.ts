'use client';
import { useEffect, useState } from 'react';
import { getSeasonalTheme, type SeasonalTheme } from '@/lib/seasons';

export function useSeason(): SeasonalTheme {
  const [theme, setTheme] = useState<SeasonalTheme>(() => getSeasonalTheme());

  useEffect(() => {
    const t = getSeasonalTheme();
    setTheme(t);

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--season-bg', t.colors.bg);
    root.style.setProperty('--season-surface', t.colors.surface);
    root.style.setProperty('--season-accent', t.colors.accent);
    root.style.setProperty('--season-accent-glow', t.colors.accentGlow);
    root.style.setProperty('--season-border', t.colors.border);
  }, []);

  return theme;
}
