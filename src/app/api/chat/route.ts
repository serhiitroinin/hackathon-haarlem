import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { getModel } from "~/lib/ai";
import { db } from "~/server/db";

// Allow streaming responses up to 30s (raise on Vercel Pro if you need longer).
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the in-app assistant for a hackathon prototype.
Be concise and action-oriented. You can actually operate the app via tools:
- createNote: save a note, optionally pinned to a map location (lat/lng).
- listNotes: read existing notes.
Haarlem city center is roughly lat 52.381, lng 4.637 — use nearby coordinates
when a user asks to pin something "in Haarlem". After using a tool, briefly tell
the user what you did.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // Let the model call a tool, see the result, then respond (multi-step).
    stopWhen: stepCountIs(5),
    tools: {
      createNote: tool({
        description:
          "Create and save a note. Optionally pin it to a location with lat/lng so it shows on the map.",
        inputSchema: z.object({
          title: z.string().describe("Short title for the note"),
          content: z.string().optional().describe("Optional body text"),
          lat: z.number().min(-90).max(90).optional(),
          lng: z.number().min(-180).max(180).optional(),
        }),
        execute: async ({ title, content, lat, lng }) => {
          const note = await db.note.create({
            data: { title, content: content ?? "", lat, lng },
          });
          return {
            id: note.id,
            title: note.title,
            pinned: note.lat != null && note.lng != null,
          };
        },
      }),
      listNotes: tool({
        description: "List existing saved notes, most recent first.",
        inputSchema: z.object({
          limit: z.number().min(1).max(50).default(10),
        }),
        execute: async ({ limit }) => {
          const notes = await db.note.findMany({
            orderBy: { createdAt: "desc" },
            take: limit,
          });
          return notes.map((n) => ({
            id: n.id,
            title: n.title,
            pinned: n.lat != null && n.lng != null,
          }));
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
