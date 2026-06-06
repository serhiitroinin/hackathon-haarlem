import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables. Add new ones here AND in `runtimeEnv` below.
   */
  server: {
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // --- AI ---------------------------------------------------------------
    // Provider keys are optional so the app boots with whichever you have.
    // The AI SDK providers read these from process.env automatically.
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    // OpenRouter (OpenAI-compatible) — Maverx provides €20 of credits per team.
    OPENROUTER_API_KEY: z.string().optional(),
    // Which provider/model the chat route uses. Swap live during the hackathon.
    AI_PROVIDER: z.enum(["anthropic", "openai", "openrouter"]).default("anthropic"),
    AI_MODEL: z.string().default("claude-sonnet-4-6"),
    // Optional stronger model just for training-content generation.
    AI_CONTENT_MODEL: z.string().optional(),
  },

  /**
   * Client-side environment variables. Prefix with `NEXT_PUBLIC_`.
   */
  client: {
    // Optional MapTiler key for nicer basemaps. Falls back to free Carto tiles.
    NEXT_PUBLIC_MAPTILER_KEY: z.string().optional(),
    // Set to "true" to pre-fill the Maverx workspace with demo data end-to-end.
    NEXT_PUBLIC_DEMO_MODE: z.enum(["true", "false"]).default("false"),
  },

  /**
   * Manual destructuring required for Next.js edge/runtime + client.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_MODEL: process.env.AI_MODEL,
    AI_CONTENT_MODEL: process.env.AI_CONTENT_MODEL,
    NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
