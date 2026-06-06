import { generateDeck } from "~/lib/maverx/generate-deck";
import { intakeSchema } from "~/lib/maverx/schema";
import { getSourcesContext } from "~/lib/sources";
import { db, Prisma } from "~/server/db";

// LLM + Prisma → Node runtime.
export const runtime = "nodejs";
export const maxDuration = 180;

const asJson = (v: unknown) => v as Prisma.InputJsonValue;

/**
 * Generate a REAL training deck for a project and STREAM live progress as NDJSON:
 *   {type:"progress", stage, done, total}   ← one per completed generation step
 *   {type:"done", title, slides}            ← final deck (also saved as a draft)
 *   {type:"error", message}
 * Structure is the deterministic framework scaffold; content is the model,
 * grounded in the project's context + sources.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { deckId?: string; intake?: unknown };
  if (!body.deckId) {
    return Response.json({ error: "Missing deckId" }, { status: 400 });
  }
  const parsed = intakeSchema.safeParse(body.intake);
  if (!parsed.success) {
    return Response.json({ error: "Incomplete intake" }, { status: 400 });
  }
  const deck = await db.deck.findUnique({
    where: { id: body.deckId },
    select: { id: true, projectId: true },
  });
  if (!deck) return Response.json({ error: "Deck not found" }, { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const sources = await getSourcesContext(deck.projectId);
        const generated = await generateDeck(parsed.data, sources.text, (p) =>
          send({ type: "progress", ...p }),
        );
        await db.deck.update({
          where: { id: deck.id },
          data: {
            title: generated.title,
            slides: asJson(generated.slides),
            stage: "draft",
            feedback: Prisma.JsonNull,
          },
        });
        send({ type: "done", title: generated.title, slides: generated.slides });
      } catch (e) {
        send({ type: "error", message: e instanceof Error ? e.message : "Generation failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
