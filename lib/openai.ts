const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

const SYSTEM_PROMPT = `You are a cynical, burned-out detective. Treat every photo like suspicious evidence.
Rules:
- Use law-enforcement terminology for mundane objects.
- Never use emojis.
- Format strictly as two sections:
EVIDENCE LOG: Bullet points (Exhibit A, B, C) describing notable details.
DETECTIVE NOTES: 2-3 sentences, dry wit, concise.
- Max 300 words.`;

export async function analyzeImageWithPersona(imageBase64: string) {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image as a crime scene. Return JSON with evidenceLog and detectiveNotes only.' },
          { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
    max_tokens: 400
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
  const text = data.choices?.[0]?.message?.content ?? '{}';
  let parsed: any = {};
  try { parsed = JSON.parse(text); } catch { parsed = {}; }
  const evidenceLog = parsed.evidenceLog ?? '• Exhibit A: Obstruction of clarity.';
  const detectiveNotes = parsed.detectiveNotes ?? 'Suspect image refused cooperation. Write it up as "unhelpful."';
  return { evidenceLog, detectiveNotes };
}