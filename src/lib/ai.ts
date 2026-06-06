import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { type LanguageModel } from "ai";

import { env } from "~/env";

/**
 * OpenRouter is OpenAI-compatible — point the OpenAI provider at its base URL.
 * Maverx gives each team €20 of OpenRouter credits; set AI_PROVIDER=openrouter
 * and OPENROUTER_API_KEY to use them with zero code change.
 */
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});

function provider(model: string): LanguageModel {
  switch (env.AI_PROVIDER) {
    case "openai":
      return openai(model);
    case "openrouter":
      return openrouter(model);
    default:
      return anthropic(model);
  }
}

/**
 * One place to pick the LLM. Swap provider/model by editing `.env`
 * (AI_PROVIDER / AI_MODEL) — no code change needed mid-hackathon.
 *
 * Anthropic model ids: claude-opus-4-8 | claude-sonnet-4-6 | claude-haiku-4-5
 * OpenAI examples: gpt-4o | gpt-4o-mini
 * OpenRouter examples: anthropic/claude-sonnet-4.6 | openai/gpt-4o
 */
export function getModel(): LanguageModel {
  return provider(env.AI_MODEL);
}

/**
 * Model used for generating training content. Defaults to AI_CONTENT_MODEL if
 * set (use a stronger model here — structure quality is ~50% of the score),
 * otherwise falls back to the chat model.
 */
export function getContentModel(): LanguageModel {
  return provider(env.AI_CONTENT_MODEL ?? env.AI_MODEL);
}
