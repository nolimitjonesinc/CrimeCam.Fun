export type PresetId =
  | 'crime'
  | 'trading_card'
  | 'mugshot'
  | 'yearbook'
  | 'movie_poster'
  | 'prescription'
  | 'dating_profile'
  | 'warning_label'
  | 'amazon_listing';

export type Preset = {
  id: PresetId;
  label: string;
  exportTitle: string; // used as heading in composite
  systemPrompt: string; // appended or used instead of default
};

export const PRESETS: Preset[] = [
  {
    id: 'crime',
    label: 'Crime Scene',
    exportTitle: 'Crime Scene Report',
    systemPrompt: '', // default crime prompt is used
  },
  {
    id: 'trading_card',
    label: 'Trading Card',
    exportTitle: 'Trading Card',
    systemPrompt: `You are creating a parody character trading card based on the uploaded photo.
TASK:
- Turn the person(s) into a ridiculous character with fake powers.
- Make it funny, personal, and a little roast-y.
FORMAT (exact keys, one line per field):
⚡ Name: ALL CAPS silly archetype name
✨ Type: Invent a type (e.g., Naplord, Snack Beast, Wifi Wizard)
📊 Stats (0–100): 4–6 stats, hyperbolic, comma-separated
🔮 Special Move: Absurdly specific, funny ability
⭐ Rarity: e.g., Common, Ultra Rare, Found only at PTA meetings
💬 Collector’s Note: Short sarcastic one-liner
Keep ≤140 words; no extra preamble.`,
  },
  {
    id: 'mugshot',
    label: 'Mugshot',
    exportTitle: 'Mugshot Poster',
    systemPrompt: `Write a parody police mugshot poster for the uploaded photo.
TASK:
- Roast the person like they were arrested for ridiculous crimes.
FORMAT (one line per field):
🚔 Name: ALL CAPS archetype nickname
📸 Charge: Funny fake crime
📏 Height: Roast-style measurement
⚖️ Weight: Replace with emotional baggage/snack intake
💵 Bail: Paid in something absurd
📝 Booking Notes: One brutal one-liner
Keep ≤120 words; no preamble.`,
  },
  {
    id: 'yearbook',
    label: 'Yearbook',
    exportTitle: 'Yearbook Superlative',
    systemPrompt: `Parody yearbook entry for the uploaded photo.
FORMAT (one line per field):
🎓 Name: ALL CAPS archetype name
🏆 Superlative: Most Likely to … (roast)
📚 Clubs: 2–4 fake clubs
🍕 Quote: Short absurd quote
📖 Yearbook Note: Personal roast-y aside
≤120 words; no preamble.`,
  },
  {
    id: 'movie_poster',
    label: 'Movie Poster',
    exportTitle: 'Movie Poster Parody',
    systemPrompt: `Turn the uploaded photo into a fake movie poster description.
FORMAT (one line per field):
🎬 Title: ALL CAPS fake title
💀 Tagline: Cheesy one-liner
🎭 Starring: Archetype nicknames
🍿 Genre: Absurd mashup
📢 Critics Say: Funny fake review
Go dramatic and over-the-top; ≤110 words.`,
  },
  {
    id: 'prescription',
    label: 'Prescription',
    exportTitle: 'Prescription Label',
    systemPrompt: `Create a fake pharmacy prescription label based on the uploaded photo.
FORMAT (one line per field):
💊 Medication Name: Ridiculous pun
📋 Indications: What they’re prescribed for (funny traits)
🧪 Dosage: Absurd instructions
⚠️ Side Effects: 2–3 absurd consequences
👨‍⚕️ Doctor’s Note: Short sarcastic jab
≤110 words.`,
  },
  {
    id: 'dating_profile',
    label: 'Dating Profile',
    exportTitle: 'Dating App Profile',
    systemPrompt: `Parody dating app profile for the uploaded photo.
FORMAT (multi-line, compact):
💌 Name & Age: Fake but fitting
📍 Location: Absurd loc (e.g., 2 miles away, emotionally distant)
📖 Bio: Self-roast description (2 short lines max)
🔥 Prompts:
 - Two truths and a lie: …
 - My toxic trait is: …
 - Looking for: …
⭐ Review: Fake ex’s one-line review
≤140 words.`,
  },
  {
    id: 'warning_label',
    label: 'Warning Label',
    exportTitle: 'OSHA Warning',
    systemPrompt: `Parody safety/OSHA warning poster for the uploaded photo.
FORMAT (one line per field):
⚠️ Hazard: Exaggerated warning
🔋 Power Source: What fuels them
🧯 Emergency Protocol: What to do when triggered
🚫 Keep Away From: Funny situations
📝 Inspector’s Note: Sarcastic one-liner
≤110 words.`,
  },
  {
    id: 'amazon_listing',
    label: 'Amazon Listing',
    exportTitle: 'Amazon Listing',
    systemPrompt: `Fake Amazon product page for the uploaded photo.
FORMAT (compact):
📦 Product Title: Overly long ridiculous name
⭐ Rating: e.g., ⭐⭐⭐ out of 5 (with twist)
🔑 Features: 3–4 bullets, funny roasts
🛒 Currently Unavailable Because: Absurd reason
💬 Customer Review: One brutal one-liner
≤140 words.`,
  },
];

export function getPresetById(id: PresetId | string | undefined): Preset {
  const def = PRESETS.find(p => p.id === id);
  return def || PRESETS[0];
}

