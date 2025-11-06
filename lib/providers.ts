import Anthropic from '@anthropic-ai/sdk';
import { getPresetById, type PresetId } from './presets';

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
    model: 'claude-3-5-haiku-20241022',
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
    model: 'claude-3-5-sonnet-20241022',
    quality: 'premium',
    displayName: 'Premium',
    description: 'Best quality (Claude Sonnet)',
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
  // Map 1..10 → 0.3..1.2
  return 0.3 + (s - 1) * ((1.2 - 0.3) / 9);
}

// Build system prompt based on mode
function buildSystemPrompt(mode?: PresetId | string): string {
  const preset = getPresetById(mode as any);
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