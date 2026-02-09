import type { PresetId } from './presets';

export type SeasonId = 'crime' | 'naughty' | 'cupid' | 'spooky' | 'beach' | 'yearbook' | 'dating';

export type SeasonalTheme = {
  seasonId: SeasonId;
  featuredMode: PresetId;
  tagline: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
    accentGlow: string;
    border: string;
  };
};

const THEMES: Record<SeasonId, SeasonalTheme> = {
  crime: {
    seasonId: 'crime',
    featuredMode: 'crime',
    tagline: 'Every photo tells a story. Usually a suspicious one.',
    colors: { bg: '#0b0b0c', surface: '#121214', accent: '#ef4444', accentGlow: 'rgba(239,68,68,0.35)', border: '#232326' },
  },
  naughty: {
    seasonId: 'naughty',
    featuredMode: 'elf',
    tagline: "They're making a list. We already checked it twice.",
    colors: { bg: '#0d0808', surface: '#141010', accent: '#C41E3A', accentGlow: 'rgba(196,30,58,0.35)', border: '#2a1a1a' },
  },
  cupid: {
    seasonId: 'cupid',
    featuredMode: 'cupid',
    tagline: "Love is blind. Our analysis isn't.",
    colors: { bg: '#0d080a', surface: '#140e10', accent: '#FF1744', accentGlow: 'rgba(255,23,68,0.35)', border: '#2a1a20' },
  },
  spooky: {
    seasonId: 'spooky',
    featuredMode: 'spooky',
    tagline: 'Some evidence defies explanation. This does too.',
    colors: { bg: '#0a0814', surface: '#100e18', accent: '#7C4DFF', accentGlow: 'rgba(124,77,255,0.35)', border: '#1e1a2e' },
  },
  beach: {
    seasonId: 'beach',
    featuredMode: 'beach_patrol',
    tagline: 'No swimming. No running. No excuses.',
    colors: { bg: '#080d10', surface: '#0e1418', accent: '#00BCD4', accentGlow: 'rgba(0,188,212,0.35)', border: '#1a2428' },
  },
  yearbook: {
    seasonId: 'yearbook',
    featuredMode: 'yearbook',
    tagline: 'Most Likely To Get Roasted.',
    colors: { bg: '#0c0a08', surface: '#141210', accent: '#C9A961', accentGlow: 'rgba(201,169,97,0.35)', border: '#2a2418' },
  },
  dating: {
    seasonId: 'dating',
    featuredMode: 'dating_profile',
    tagline: 'Swipe left on dignity.',
    colors: { bg: '#0d080a', surface: '#140e11', accent: '#FF006E', accentGlow: 'rgba(255,0,110,0.35)', border: '#2a1a22' },
  },
};

export function getSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  // December → Nice or Naughty
  if (month === 11) return THEMES.naughty;
  // February 1-14 → Cupid
  if (month === 1 && day <= 14) return THEMES.cupid;
  // October → Spooky
  if (month === 9) return THEMES.spooky;
  // June-August → Beach
  if (month >= 5 && month <= 7) return THEMES.beach;
  // September → Yearbook
  if (month === 8) return THEMES.yearbook;
  // March-May → Dating
  if (month >= 2 && month <= 4) return THEMES.dating;
  // Default
  return THEMES.crime;
}

export { THEMES };
