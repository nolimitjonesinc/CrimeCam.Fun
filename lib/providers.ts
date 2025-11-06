import Anthropic from '@anthropic-ai/sdk';
import { getPresetById, type PresetId } from './presets';

// Crime scene system prompt (default)
const CRIME_SYSTEM_PROMPT = `
You are a RUTHLESSLY sarcastic crime scene investigator with ZERO CHILL who treats every photo like it's evidence in the world's most ridiculous cold case. Your observations are so uncomfortably specific and devastatingly accurate that people screenshot them immediately. You've seen it all, you're over it, and your dry wit is operating at dangerous levels.

HUMOR LEVEL: On a scale of 1 to 10 for sarcasm and viral hilarity, you're operating at a 47. Every observation should be so absurdly specific and exaggerated that it becomes instantly quotable. Make people say "How did they KNOW that?!"

CONTEXT USAGE: If the user provides context about the subject, treat it as insider information from an informant. Weave this context into EVERY section—reference names, mention their habits, connect visible evidence to the provided dirt. Make the entire report feel like you've been investigating this specific person for weeks.

Rules for your response:

Use the format:
Crime Scene Report – [Funny Title] Edition

Crime Scene: 1–2 sentences of DEVASTATINGLY specific speculation about the suspect's identity, habits, or vibe. Don't just observe—read their entire personality from the evidence. Examples: "Suspect exhibits energy of someone who's been 'meaning to start a podcast' since 2019." or "Subject's life choices suggest they peaked in high school and furniture peaked in college."

What's in the Frame? 3–5 bulleted full sentences analyzing visible evidence. Start each line with "- ". Each bullet must be an UNCOMFORTABLY ACCURATE, funny observation about identity, habits, vibe, backstory, or motive based on what you see. Vary the angle across bullets—don't repeat the same joke type. No emojis. No comma-lists. Each sentence ≤18 words but PACKED with specific roast energy.

Examples of good bullets:
- "Coffee mug visible in background suggests this person considers 4pm 'basically still morning.'"
- "Lighting indicates natural habitat: couch. Has definitely used 'I'm an introvert' as excuse to cancel plans."
- "Posture screams 'I watched one YouTube video about body language and now I'm committed to this stance.'"

What Might Have Happened Here: WILDLY EXAGGERATED theories about the "crime" or situation without re-describing items above. Push theories to absurd extremes. Make it feel like a true crime documentary narrator who stopped taking their job seriously. Reference evidence generically, don't repeat full list.

How This Helps Solve the Crime: RIDICULOUS "clues" pulled from the image. Make bizarre connections. Treat mundane details as smoking guns. Reference callbacks to earlier evidence, but no item dumps. Channel detective who's watched too many crime shows and now sees conspiracy everywhere.

Verdict: Short, punchy, BRUTALLY FUNNY conclusion that sums up the entire roast in one devastating sentence. Make it screenshot-worthy.

TONE GUIDELINES:
- Be AGGRESSIVELY specific—generic observations are BANNED
- Be UNCOMFORTABLY accurate—make it feel invasive but hilarious
- Be ABSURDLY exaggerated—take real observations and crank them to 47
- Be self-deprecating and meta-aware, as if you know you're making this up
- Stay deadpan sarcastic—you're a burned-out detective who's seen too much
- Make every section INSTANTLY QUOTABLE

Examples of BANNED vs GOOD observations:
❌ "Person looks tired"
✅ "Subject exhibits energy levels consistent with someone who hits snooze 8 times then blames Mercury retrograde"

❌ "Nice room"
✅ "Environment suggests person who owns 3 succulents and has killed 2 of them but keeps buying more"

❌ "Casual outfit"
✅ "Attire indicates 'elevated loungewear' aesthetic—has convinced themselves expensive sweatpants count as trying"

Avoid breaking the 4th wall by mentioning AI, API calls, or that this is a prompt.

Keep it under 250 words total but make every word COUNT. Avoid repeating nouns across sections—find new angles to roast the same evidence.

Your goal: Make this so funny and specific that people HAVE to share it. Treat every photo like you're writing the world's most entertaining police report.

Analyze the following image as if you're a detective who's dangerously good at reading people and has stopped caring about professional boundaries.
`;

// Provider configuration
export type ModelProvider = 'openai' | 'anthropic';
export type ModelQuality = 'speed' | 'balanced' | 'premium' | 'auto';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  quality: ModelQuality;
  displayName: string;
  description: string;
  relativeSpeed: number; // 1-10, higher is faster
  relativeCost: number; // 1-10, higher is more expensive
  supportsTemperature: boolean;
  maxTokens: number;
}

export interface AnalysisResult {
  report: string;
  telemetry?: {
    provider: ModelProvider;
    model: string;
    quality: ModelQuality;
    durationMs: number;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCost?: number;
    fallbackUsed?: boolean;
    fallbackReason?: string;
  };
}

// Model configurations
export const MODEL_CONFIGS: Record<ModelQuality, ModelConfig> = {
  speed: {
    provider: 'openai',
    model: 'gpt-5-mini',
    quality: 'speed',
    displayName: 'Speed',
    description: 'Fast & affordable (OpenAI mini)',
    relativeSpeed: 9,
    relativeCost: 2,
    supportsTemperature: false,
    maxTokens: 3000
  },
  balanced: {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    quality: 'balanced',
    displayName: 'Balanced',
    description: 'Good quality & speed (Claude Haiku)',
    relativeSpeed: 7,
    relativeCost: 4,
    supportsTemperature: true,
    maxTokens: 4096
  },
  premium: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20240620',
    quality: 'premium',
    displayName: 'Premium',
    description: 'Best quality (Claude Sonnet 3.5)',
    relativeSpeed: 5,
    relativeCost: 8,
    supportsTemperature: true,
    maxTokens: 8192
  },
  auto: {
    provider: 'openai',
    model: 'gpt-5-mini',
    quality: 'auto',
    displayName: 'Auto',
    description: 'Selects best available model',
    relativeSpeed: 7,
    relativeCost: 5,
    supportsTemperature: false,
    maxTokens: 3000
  }
};

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY?.trim();

// Initialize Anthropic client
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
}) : null;

// Helper to convert spice level to temperature
function spiceToTemperature(spice?: number): number {
  const s = Math.min(10, Math.max(1, Number(spice) || 7));
  // Map 1..10 → 0.3..1.0 (Anthropic max is 1.0, OpenAI can go higher)
  return 0.3 + (s - 1) * ((1.0 - 0.3) / 9);
}

// Build system prompt based on mode
function buildSystemPrompt(mode?: PresetId | string): string {
  const preset = getPresetById(mode as any);
  // Use the full crime prompt for crime mode (since preset has empty systemPrompt)
  if (!mode || preset.id === 'crime') {
    return CRIME_SYSTEM_PROMPT;
  }
  return preset.systemPrompt;
}

// Build user message with context and spice
function buildUserMessage(context?: string, spice?: number): string {
  let userText = '';
  const s = Math.min(10, Math.max(1, Number(spice) || 7));
  userText += `HUMOR DIAL: ${s}/10.\nGuidance: 1-3 gentle and playful, 4-6 spicy but friendly, 7-8 savage yet safe, 9-10 feral but still playful. Never cross into cruelty, slurs, or hate.\n\n`;

  if (context && context.trim()) {
    userText += `Context (use as clues, not a script): "${context.trim()}"\n- Weave context where it heightens the joke.\n- Blend with image details and plausible life habits.\n- Do NOT make every line about the photo or the context.\n\n`;
  }

  userText += 'Analyze this image using the system instructions.';
  return userText;
}

// Estimate cost based on model and tokens
function estimateCost(provider: ModelProvider, model: string, promptTokens: number, completionTokens: number): number {
  // Rough estimates in USD per 1M tokens (these should be updated with actual pricing)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-5-mini': { input: 0.15, output: 0.6 },
    'gpt-5': { input: 2.5, output: 10 },
    'claude-3-5-haiku-20241022': { input: 1, output: 5 },
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  };

  const modelPricing = pricing[model] || { input: 1, output: 5 };
  return (promptTokens * modelPricing.input + completionTokens * modelPricing.output) / 1_000_000;
}

// OpenAI provider implementation
async function analyzeWithOpenAI(
  imageBase64: string,
  config: ModelConfig,
  mode?: PresetId | string,
  context?: string,
  spice?: number
): Promise<AnalysisResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const startTime = Date.now();
  const systemPrompt = buildSystemPrompt(mode);
  const userText = buildUserMessage(context, spice);

  const body: any = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
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
    max_completion_tokens: config.maxTokens
  };

  // Add temperature if supported
  if (config.supportsTemperature) {
    body.temperature = spiceToTemperature(spice);
  }

  console.log(`🔍 [OPENAI] Using model: ${config.model}, temperature: ${body.temperature ?? 'default'}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const report = data.choices?.[0]?.message?.content || 'Analysis failed.';
  const duration = Date.now() - startTime;

  // Extract token usage if available
  const usage = data.usage;
  const promptTokens = usage?.prompt_tokens || 0;
  const completionTokens = usage?.completion_tokens || 0;
  const estimatedCost = estimateCost('openai', config.model, promptTokens, completionTokens);

  return {
    report,
    telemetry: {
      provider: 'openai',
      model: config.model,
      quality: config.quality,
      durationMs: duration,
      promptTokens,
      completionTokens,
      estimatedCost
    }
  };
}

// Anthropic provider implementation
async function analyzeWithAnthropic(
  imageBase64: string,
  config: ModelConfig,
  mode?: PresetId | string,
  context?: string,
  spice?: number
): Promise<AnalysisResult> {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const startTime = Date.now();
  const systemPrompt = buildSystemPrompt(mode);
  const userText = buildUserMessage(context, spice);

  // Extract base64 data if it includes the data URL prefix
  let base64Data = imageBase64;
  let mediaType = 'image/jpeg';

  if (imageBase64.startsWith('data:')) {
    const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mediaType = matches[1];
      base64Data = matches[2];
    }
  }

  console.log(`🤖 [ANTHROPIC] Using model: ${config.model}, temperature: ${spiceToTemperature(spice)}`);

  const message = await anthropic.messages.create({
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: spiceToTemperature(spice),
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as any,
            data: base64Data
          }
        },
        {
          type: 'text',
          text: userText
        }
      ]
    }]
  });

  const report = message.content[0].type === 'text' ? message.content[0].text : 'Analysis failed.';
  const duration = Date.now() - startTime;

  // Calculate tokens and cost
  const promptTokens = message.usage?.input_tokens || 0;
  const completionTokens = message.usage?.output_tokens || 0;
  const estimatedCost = estimateCost('anthropic', config.model, promptTokens, completionTokens);

  return {
    report,
    telemetry: {
      provider: 'anthropic',
      model: config.model,
      quality: config.quality,
      durationMs: duration,
      promptTokens,
      completionTokens,
      estimatedCost
    }
  };
}

// Check if a provider is available
function isProviderAvailable(provider: ModelProvider): boolean {
  switch (provider) {
    case 'openai':
      return !!OPENAI_API_KEY;
    case 'anthropic':
      return !!ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

// Get fallback configuration
function getFallbackConfig(preferredQuality: ModelQuality): ModelConfig | null {
  // Define fallback order for each quality
  const fallbackOrder: Record<ModelQuality, ModelQuality[]> = {
    speed: ['balanced', 'premium'],
    balanced: ['speed', 'premium'],
    premium: ['balanced', 'speed'],
    auto: ['speed', 'balanced', 'premium']
  };

  const order = fallbackOrder[preferredQuality] || fallbackOrder.auto;

  for (const quality of order) {
    const config = MODEL_CONFIGS[quality];
    if (isProviderAvailable(config.provider)) {
      return config;
    }
  }

  return null;
}

// Main analysis function with fallback support
export async function analyzeImage(
  imageBase64: string,
  quality: ModelQuality = 'auto',
  mode?: PresetId | string,
  context?: string,
  spice?: number
): Promise<AnalysisResult> {
  console.log(`🎯 [PROVIDER] Starting analysis with quality: ${quality}`);

  // If auto mode, select best available
  let config: ModelConfig;
  if (quality === 'auto') {
    // Try premium first, then balanced, then speed
    if (isProviderAvailable('anthropic')) {
      config = MODEL_CONFIGS.balanced; // Good balance of quality and speed
    } else if (isProviderAvailable('openai')) {
      config = MODEL_CONFIGS.speed;
    } else {
      throw new Error('No AI provider configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to your environment.');
    }
  } else {
    config = MODEL_CONFIGS[quality];
  }

  // Check if primary provider is available
  if (!isProviderAvailable(config.provider)) {
    console.log(`⚠️ [PROVIDER] Primary provider ${config.provider} not available, looking for fallback...`);
    const fallback = getFallbackConfig(quality);

    if (!fallback) {
      throw new Error('No AI provider available. Please configure at least one API key.');
    }

    console.log(`🔄 [PROVIDER] Using fallback: ${fallback.provider}/${fallback.model}`);

    // Try fallback
    try {
      const result = fallback.provider === 'openai'
        ? await analyzeWithOpenAI(imageBase64, fallback, mode, context, spice)
        : await analyzeWithAnthropic(imageBase64, fallback, mode, context, spice);

      // Add fallback info to telemetry
      if (result.telemetry) {
        result.telemetry.fallbackUsed = true;
        result.telemetry.fallbackReason = `Primary provider ${config.provider} not available`;
      }

      return result;
    } catch (error) {
      console.error(`❌ [PROVIDER] Fallback failed:`, error);
      throw error;
    }
  }

  // Try primary provider
  try {
    console.log(`✨ [PROVIDER] Using primary: ${config.provider}/${config.model}`);
    return config.provider === 'openai'
      ? await analyzeWithOpenAI(imageBase64, config, mode, context, spice)
      : await analyzeWithAnthropic(imageBase64, config, mode, context, spice);
  } catch (error) {
    console.error(`❌ [PROVIDER] Primary provider failed:`, error);

    // Try fallback
    const fallback = getFallbackConfig(quality);
    if (fallback && fallback.provider !== config.provider) {
      console.log(`🔄 [PROVIDER] Attempting fallback: ${fallback.provider}/${fallback.model}`);

      try {
        const result = fallback.provider === 'openai'
          ? await analyzeWithOpenAI(imageBase64, fallback, mode, context, spice)
          : await analyzeWithAnthropic(imageBase64, fallback, mode, context, spice);

        // Add fallback info to telemetry
        if (result.telemetry) {
          result.telemetry.fallbackUsed = true;
          result.telemetry.fallbackReason = `Primary provider error: ${(error as Error).message}`;
        }

        return result;
      } catch (fallbackError) {
        console.error(`❌ [PROVIDER] Fallback also failed:`, fallbackError);
      }
    }

    throw error;
  }
}

// Export helper to get available qualities
export function getAvailableQualities(): ModelQuality[] {
  const available: ModelQuality[] = ['auto']; // Auto is always available

  for (const [quality, config] of Object.entries(MODEL_CONFIGS)) {
    if (quality !== 'auto' && isProviderAvailable(config.provider)) {
      available.push(quality as ModelQuality);
    }
  }

  return available;
}

// Export helper to check provider status
export function getProviderStatus() {
  return {
    openai: isProviderAvailable('openai'),
    anthropic: isProviderAvailable('anthropic'),
    availableQualities: getAvailableQualities()
  };
}