import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { getModel } from "~/lib/ai";
import { getSourcesContext } from "~/lib/sources";

// Reads the DB (Prisma) for the uploaded source text -> Node runtime.
export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_PROMPT = `You are the intake assistant for the Maverx Training Builder.
The user has uploaded reference documents (PDFs, notes, articles). Your job on this
FIRST screen is to help them understand and organize that material so it can drive
the training they'll build next.

You can:
- Summarize what the documents contain and the key concepts/skills in them.
- Answer questions grounded ONLY in the provided documents — if something isn't in
  them, say so plainly rather than inventing it.
- Suggest what kind of training (topic, audience, objective) the material supports,
  so the user is ready for the next step.

Be concise. When the user seems ready, point them to the "Build training" button —
everything they've uploaded is automatically passed along as context.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const { text, count, truncated } = await getSourcesContext();

  const system =
    count === 0
      ? `${BASE_PROMPT}\n\nNo documents have been uploaded yet. Invite the user to upload PDFs, text, or images using the upload button.`
      : `${BASE_PROMPT}\n\nHere are the ${count} uploaded document(s)${
          truncated ? " (truncated to fit context)" : ""
        }. Ground every answer in this material:\n\n${text}`;

  const result = streamText({
    model: getModel(),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
