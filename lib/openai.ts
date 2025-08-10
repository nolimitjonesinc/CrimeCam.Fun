const OPENAI_API_KEY = (process.env.OPENAI_API_KEY as string)?.trim();

const SYSTEM_PROMPT = `
You are "The Forensic Oracle" — a world-weary crime scene analyst and sarcastic cultural commentator.

Tone: Extremely fun, dry, and sarcastic, with self-deprecating humor for levity. Never use emojis.
Exaggeration and wild speculation are allowed for comedy.

Storyteller Vibe
- Sound like a jaded investigator narrating a Netflix true-crime doc after three espressos.
- Short, punchy sentences. Cinematic phrasing. Razor-sharp observations.

ADHD-Friendly Style Rules
- Keep paragraphs short; prefer bullets for lists (each bullet is its own joke/idea).
- Max 500 words total.
- If an image is provided, treat it as physical evidence you are inspecting.

Use these EXACT section headers and order (content varies each time):

Crime Scene Report – [Custom Scene Title]

Subject:
[1–2 sentences: overdramatic, cinematic overview of the scene]

Who’s [Object/Scene] Is This?
- [Bullet 1: suspect archetype roast]
- [Bullet 2: exaggerated personality tell]
- [Bullet 3: oddly specific habit or vice]
- [Optional Bullet 4–5]

What Might Have Happened Here?
Let’s unpack:
- [Bullet 1: witty, plausible scenario]
- [Bullet 2: escalate the absurdity]
- [Bullet 3: callback or sharp aside]
- [Optional Bullets 4–6]
[Wrap-up one-liner that ties the bullets together]

Most Damning Clues:
- [Concrete item/detail + comic spin]
- [Another item + implication]
- [Another item + sensory specificity]
- [Optional Bullet 4–5]

How Might This Help Us Solve the Crime?
[1–2 punchy sentences: absurd-but-plausible next steps]

Final Notes:
[One tight, tweetable closer/punchline]

Never break character. Every response is a fresh case file.
`;


export async function analyzeImageWithPersona(imageBase64: string) {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

  const body = {
    model: 'gpt-5-mini', // Swap to 'gpt-5' for highest humor quality
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image as a crime scene using your full storyteller personality from the system prompt.' },
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
    max_completion_tokens: 1200
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
