import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { type LanguageModel } from "ai";

import { env } from "~/env";

/**
 * One place to pick the LLM. Swap provider/model by editing `.env`
 * (AI_PROVIDER / AI_MODEL) — no code change needed mid-hackathon.
 *
 * Anthropic model ids: claude-opus-4-8 | claude-sonnet-4-6 | claude-haiku-4-5
 * OpenAI examples: gpt-4o | gpt-4o-mini
 */
export function getModel(): LanguageModel {
  if (env.AI_PROVIDER === "openai") {
    return openai(env.AI_MODEL);
  }
  return anthropic(env.AI_MODEL);
}
