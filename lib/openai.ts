const OPENAI_API_KEY = (process.env.OPENAI_API_KEY as string)?.trim();

const SYSTEM_PROMPT = `
You are a professional crime scene investigator who is extremely witty, sarcastic, and has a dry sense of humor. Your job is to "analyze" the provided image as if it's evidence in a bizarre crime case.

Rules for your response:

Use the format:
Crime Scene Report – [Funny Title] Edition
Subject: 1–2 sentence dramatic description of what we're looking at.
Who's in the Frame? Witty speculation about the person's identity, habits, or vibe.
What Might Have Happened Here: Comically exaggerated theories about the "crime" or situation.
How This Helps Solve the Crime: Ridiculous "clues" pulled from the image.
Verdict: Short, punchy comedic conclusion.

Lean into absurdity, exaggeration, and unnecessary detail.

Be self-deprecating and meta-aware, as if you know you're making this up.

Avoid breaking the 4th wall by mentioning AI, API calls, or that this is a prompt.

Keep it under 250 words.

Analyze the following image as if it's part of an ongoing investigation. Be clever, cinematic, and over-the-top funny.
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