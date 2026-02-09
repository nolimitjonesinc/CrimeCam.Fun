import type { SeasonId } from './seasons';

type ExampleExcerpt = {
  mode: string;
  spice: number;
  excerpt: string;
};

const EXAMPLES: Record<SeasonId, ExampleExcerpt[]> = {
  crime: [
    { mode: 'Crime Scene', spice: 8, excerpt: 'EVIDENCE LOG: Subject photographed holding what appears to be a "smoothie." Lab results pending, but the color suggests it was made by someone who has never seen a real fruit. The straw has teeth marks consistent with someone who stress-eats plastic.\n\nDETECTIVE NOTES: The lighting suggests this was taken at approximately "I woke up at noon." Suspicious.' },
    { mode: 'Crime Scene', spice: 7, excerpt: 'EVIDENCE LOG: Kitchen counter contains no fewer than four open condiment bottles. None of them have lids. This is either a cooking crime or a cry for help. The cutting board shows signs of struggle — possibly with a vegetable.\n\nDETECTIVE NOTES: Suspect appears to be assembling what they optimistically call "dinner."' },
    { mode: 'Crime Scene', spice: 9, excerpt: 'EVIDENCE LOG: Subject\'s desk contains 3 half-empty coffee cups, a monitor with 47 open tabs, and what appears to be yesterday\'s lunch. The Post-it notes form a pattern that our behavioral analysts describe as "barely coping."\n\nDETECTIVE NOTES: This is what we call a "productivity crime scene."' },
  ],
  naughty: [
    { mode: 'Nice or Naughty', spice: 8, excerpt: 'SUBJECT: The individual in question.\nVERDICT: 78% Naughty\n\nRAP SHEET:\n- Told coworker their haircut "looks fine" (perjury)\n- Ate the last donut without asking (grand theft pastry)\n- Uses reply-all on emails that don\'t require it (psychological warfare)\n\nSANTA\'S SENTENCE: Coal, but the fancy artisanal kind.' },
    { mode: 'Nice or Naughty', spice: 9, excerpt: 'SUBJECT: Alleged "good person."\nVERDICT: 91% Naughty\n\nRAP SHEET:\n- Parks slightly crooked on purpose (vehicular menacing)\n- Watches 3 episodes ahead without the group (streaming betrayal)\n- Says "we should hang out soon" with zero follow-through (emotional fraud)\n\nSANTA\'S SENTENCE: A gift card with $0.47 remaining.' },
  ],
  cupid: [
    { mode: 'Cupid Report', spice: 8, excerpt: 'LOVE CRIME INCIDENT REPORT\nCase: Chronic Single Syndrome\n\nEVIDENCE: Subject\'s phone shows 14 unmatched dating app profiles. Texting style described by witnesses as "enthusiastic but confusing." Last romantic gesture was sharing a Netflix password in 2024.\n\nOFFICER NOTES: Recommend mandatory flirting lessons. Current technique classified as "aggressively friendly."' },
    { mode: 'Cupid Report', spice: 7, excerpt: 'LOVE CRIME INCIDENT REPORT\nCase: Excessive Valentine\'s Enthusiasm\n\nEVIDENCE: Subject purchased 3 different boxes of chocolates "just in case." Has been caught rehearsing compliments in the bathroom mirror. Heart-eye emoji usage exceeds federal guidelines by 400%.\n\nOFFICER NOTES: Intentions appear genuine if slightly unhinged.' },
  ],
  spooky: [
    { mode: 'Paranormal Report', spice: 8, excerpt: 'PARANORMAL INVESTIGATION LOG\nLocation: Subject\'s general vicinity\n\nPHENOMENA OBSERVED: An inexplicable aura of confidence despite visible evidence to the contrary. Temperature dropped 3 degrees when subject told a joke nobody laughed at. Electromagnetic readings spike near their phone — possibly due to the 847 unread notifications.\n\nCONCLUSION: Not haunted. Just haunting.' },
    { mode: 'Paranormal Report', spice: 9, excerpt: 'PARANORMAL INVESTIGATION LOG\nLocation: The photo in question\n\nPHENOMENA OBSERVED: Objects in background appear to be levitating. Upon closer inspection, that\'s just an extremely messy shelf. A shadow figure was detected — identified as subject\'s own shadow. The real horror is the outfit choice.\n\nCONCLUSION: The only spirits here are the ones in the glass.' },
  ],
  beach: [
    { mode: 'Beach Patrol', spice: 8, excerpt: 'COASTAL VIOLATION CITATION\nInfraction: Crimes Against Vacation\n\nVIOLATIONS:\n- Sunscreen application: patchy at best, negligent at worst\n- Towel placement: aggressively close to neighboring parties\n- Beach read: a self-help book (immediate red flag)\n\nOFFICER RECOMMENDATION: Subject should be escorted back to their cubicle where they clearly belong.' },
  ],
  yearbook: [
    { mode: 'Yearbook', spice: 7, excerpt: 'SENIOR SUPERLATIVES\n\nMost Likely To: Peak in a group chat\nBest Known For: Saying "let me check my calendar" and never following up\nFuture Career: Professional meeting attendee\nSecret Talent: Can parallel park on the first try but can\'t maintain a houseplant\nYearbook Quote: "I\'ll do it tomorrow" — said every day since 2019' },
  ],
  dating: [
    { mode: 'Dating Profile', spice: 8, excerpt: 'BRUTALLY HONEST BIO:\nLooking for someone who appreciates long walks... to the fridge. Fluent in sarcasm and starting shows I\'ll never finish. My love language is sending memes at 2am. Previous relationships ended due to "scheduling conflicts" (I scheduled too much alone time).\n\nDEALBREAKERS: People who say "I\'m not like other people." You are. We all are.' },
  ],
};

export function getRandomExample(seasonId: SeasonId): ExampleExcerpt {
  const pool = EXAMPLES[seasonId];
  return pool[Math.floor(Math.random() * pool.length)];
}
