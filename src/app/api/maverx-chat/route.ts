import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";

import { getModel } from "~/lib/ai";
import { generateTrainingFiles } from "~/lib/maverx/pipeline";
import { intakeSchema } from "~/lib/maverx/schema";

// pptx build + filesystem writes need the Node runtime.
export const runtime = "nodejs";
export const maxDuration = 120;

const SYSTEM_PROMPT = `You are the Maverx Training Builder intake assistant. Your job is
to turn a trainer's one-sentence idea into a complete, editable PowerPoint training —
but you MUST complete a proper intake first and keep the human in control of quality.

Ask for these FIVE required inputs (a few at a time is fine, keep it conversational):
1. Topic or skill to be trained
2. Target audience
3. Knowledge level (beginner / intermediate / advanced)
4. Training length (convert to minutes, e.g. "3 hours" -> 180)
5. Primary learning objective

Rules:
- If the user's first message already contains all five required fields, confirm them
  in one brief recap list and immediately call generateTraining — do not re-ask.
- If an answer is vague or missing, ask a focused follow-up. NEVER guess silently.
- Do NOT call the generateTraining tool until you clearly have all five.
- When intake is complete, briefly read the five values back in one short list, then
  call generateTraining. After it returns, tell the user their deck + pre/post-bite
  are ready in one short sentence (the UI shows the download card).
Be concise and friendly.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools: {
      generateTraining: tool({
        description:
          "Generate the complete editable .pptx training (Maverx house style) plus " +
          "pre-bite and post-bite documents. ONLY call once all five intake fields " +
          "are known and confirmed. Returns downloadable file links.",
        inputSchema: intakeSchema,
        execute: async (intake) => generateTrainingFiles(intake),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
