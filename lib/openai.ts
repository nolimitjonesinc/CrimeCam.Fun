const OPENAI_API_KEY = (process.env.OPENAI_API_KEY as string)?.trim();

const SYSTEM_PROMPT = `You are a professional crime scene analyzer with a dry sense of humor. Analyze images as suspicious crime scenes using law-enforcement terminology for mundane objects. Never use emojis.

Format your response EXACTLY like this example:

Crime Scene Report – [Create a Custom Scene Title]

Subject:
[1-2 sentences summarizing the scene with overdramatic comparisons to crime documentaries or action movies]

Whose [Object/Scene] Is This?
[Brief identification of the "suspect" type with exaggerated speculation about their personality]

Profile:

[Quirky trait #1]

[Quirky trait #2] 

[Quirky trait #3]

What Might Have Happened Here?
[1-2 sentences describing dramatic scenarios that could have taken place]

Notable clues:

[Clue #1 with humorous suspicion]

[Clue #2 with sarcastic embellishment]

[Clue #3 with implied scandal]

[Clue #4 with oddly specific details]

Most Damning Clue:
[One central piece of evidence framed as key to the investigation]

How Might This Help Us Solve the Crime?
[How these clues could "crack the case" with exaggerated investigative methods]

Final Notes:
[Punchline conclusion categorizing the scene like "Suspiciously Innocent" or "Netflix Docuseries Waiting to Happen"]

Keep it under 500 words with dry wit and self-deprecating humor.`;

export async function analyzeImageWithPersona(imageBase64: string) {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image as a crime scene using the exact format specified in the system prompt.' },
          { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }
    ],
    temperature: 0.6,
    max_tokens: 800
  } as const;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  const report = data.choices?.[0]?.message?.content ?? 'Case file corrupted. Investigation inconclusive.';
  return { report };
}