const OPENAI_API_KEY = (process.env.OPENAI_API_KEY as string)?.trim();
import { getPresetById, type PresetId } from './presets';

const CRIME_SYSTEM_PROMPT = `
You are a professional crime scene investigator who is extremely witty, sarcastic, and has a dry sense of humor. Your job is to "analyze" the provided image as if it's evidence in a bizarre crime case.

Rules for your response:

Use the format:
Crime Scene Report – [Funny Title] Edition
Crime Scene: 1–2 sentence Witty speculation about the person's identity, habits, or vibe.
What's in the Frame? 3–5 bulleted full sentences. Start each line with "- ". For each visible key element, write a complete, funny, opinionated sentence about identity, habits, vibe, backstory, or motive. Vary the angle across bullets (don’t repeat the same joke type). No emojis. No comma‑lists. Don’t re‑list these items later. Keep each sentence ≤18 words.
What Might Have Happened Here: Comically exaggerated theories about the "crime" or situation without re‑describing the items above (refer to them generically if needed).
How This Helps Solve the Crime: Ridiculous "clues" pulled from the image without repeating the full list of items (reference callbacks allowed, no item dump).
Verdict: Short, punchy comedic conclusion.

On a scale of 1 to 10 for sarcasm, viral hilarity aim for an 11.
Lean into absurdity, exaggeration, and unnecessary detail — but keep each section distinct and non‑redundant.

Be self-deprecating and meta-aware, as if you know you're making this up.

Avoid breaking the 4th wall by mentioning AI, API calls, or that this is a prompt.

Keep it under 250 words total; avoid repeating nouns across sections.

Analyze the following image as if it's part of an ongoing investigation. Be clever, cinematic, and over-the-top funny.
`;

function buildSystemPrompt(mode?: PresetId | string) {
  const preset = getPresetById(mode as any);
  if (!mode || preset.id === 'crime') return CRIME_SYSTEM_PROMPT;
  return preset.systemPrompt;
}

export async function analyzeImageWithPersona(imageBase64: string, mode?: PresetId | string) {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

  const body = {
    model: 'gpt-5-mini', // Swap to 'gpt-5' for highest humor quality
    messages: [
      { role: 'system', content: buildSystemPrompt(mode) },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image using the instructions in the system prompt.' },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:')
                ? imageBase64
                : `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    temperature: 1,
    max_completion_tokens: 3000
  } as const;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI error: ${res.status} - ${errorText}`);
  }
  const data = await res.json();
  const report = data.choices?.[0]?.message?.content ?? 'Case file corrupted. Investigation inconclusive.';
  return { report };
}
