import { type Deck } from "~/components/builder/types";
import { reviseSlides } from "~/lib/maverx/revise-slides";
import { db, Prisma } from "~/server/db";

// LLM call + Prisma → Node runtime.
export const runtime = "nodejs";
export const maxDuration = 120;

const asJson = (v: unknown) => v as Prisma.InputJsonValue;

/**
 * Take a draft deck's slides + reviewer feedback (inline comments + chat),
 * revise via the content model, snapshot the draft, and flip the deck to the
 * editable hi-fi stage.
 */
export async function POST(req: Request) {
  const { deckId } = (await req.json()) as { deckId: string };
  const row = await db.deck.findUnique({ where: { id: deckId } });
  if (!row) return Response.json({ error: "Deck not found" }, { status: 404 });

  const slides = (row.slides as unknown as Deck["slides"]) ?? [];
  const rawFeedback = row.feedback as unknown;
  const deck: Deck = {
    title: row.title,
    slides: Array.isArray(slides) ? slides : [],
    feedback: Array.isArray(rawFeedback) ? (rawFeedback as Deck["feedback"]) : [],
  };
  if (deck.slides.length === 0) {
    return Response.json({ error: "Empty deck" }, { status: 400 });
  }

  const revised = await reviseSlides(deck);

  // Keep the draft in version history before overwriting.
  await db.deckVersion.create({
    data: { deckId, label: "Draft (pre-revision)", slides: asJson(row.slides) },
  });

  const updated = await db.deck.update({
    where: { id: deckId },
    data: { slides: asJson(revised), stage: "hifi", feedback: Prisma.JsonNull },
  });

  return Response.json({
    ok: true,
    stage: "hifi",
    title: updated.title,
    slides: revised,
  });
}
