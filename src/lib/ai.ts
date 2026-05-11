/**
 * AI client configuration for summarization and translation.
 * Uses OpenAI GPT-4o-mini for optimal cost/quality ratio.
 */

import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY && process.env.NODE_ENV === "production") {
  console.warn("⚠️ OPENAI_API_KEY is not set. AI features will not work.");
}

export const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

/**
 * The default model for all AI operations.
 * GPT-4o-mini provides the best cost/quality ratio for summarization and translation.
 */
export const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Generate a completion with structured error handling.
 */
export async function generateCompletion(options: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI client not configured. Set OPENAI_API_KEY.");
  }

  const response = await openai.chat.completions.create({
    model: options.model ?? DEFAULT_MODEL,
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt },
    ],
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.3,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned empty response.");
  }

  return content;
}

/**
 * Generate a streaming completion for real-time UI updates.
 */
export async function* generateStreamingCompletion(options: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): AsyncGenerator<string> {
  if (!openai) {
    throw new Error("OpenAI client not configured. Set OPENAI_API_KEY.");
  }

  const stream = await openai.chat.completions.create({
    model: options.model ?? DEFAULT_MODEL,
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userPrompt },
    ],
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.3,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
