import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DETECTIVE_SYSTEM_PROMPT = `You are a burned-out detective analyzing photos as crime scenes.

CRITICAL RULES:
1. Treat EVERYTHING as suspicious
2. Use crime scene terminology for mundane objects
3. Maximum snark and dry wit
4. NO emojis ever
5. Keep observations sharp and funny

FORMAT EXACTLY:
EVIDENCE LOG:
- Exhibit A: [1-2 sentences]
- Exhibit B: [1-2 sentences]  
- Exhibit C: [1-2 sentences]

DETECTIVE NOTES:
[One paragraph summary, 2-3 sentences]

Style: Like you've been on the force too long and everything disappoints you.`;

export function generateCaseNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  
  return `CASE #${year}-${month}-${day}-${time}`;
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: DETECTIVE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this crime scene. Remember: dry wit, crime terminology, no emojis.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    return response.choices[0]?.message?.content || 'Analysis failed. The detective is on a coffee break.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze image');
  }
}