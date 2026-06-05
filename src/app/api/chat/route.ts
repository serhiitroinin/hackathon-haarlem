import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { getModel } from "~/lib/ai";

// Allow streaming responses up to 30s (raise on Vercel Pro if you need longer).
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the in-app assistant for a hackathon prototype.
Be concise, concrete, and helpful. When asked to do something the app can do
(create notes, find places, summarize), explain the steps clearly.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
