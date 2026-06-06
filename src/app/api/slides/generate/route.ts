import { generateDeck } from "~/lib/maverx/generate-deck";
import { intakeSchema } from "~/lib/maverx/schema";
import { getSourcesContext } from "~/lib/sources";
import { db, Prisma } from "~/server/db";

// LLM + Prisma → Node runtime.
export const runtime = "nodejs";
export const maxDuration = 180;

const asJson = (v: unknown) => v as Prisma.InputJsonValue;

/**
 * Generate a REAL training deck for a project: deterministic framework scaffold
 * (computeBudget/buildScaffold) filled by the content model, grounded in the
 * project's context + sources. Lands as a draft for review.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { deckId?: string; intake?: unknown };
  if (!body.deckId) {
    return Response.json({ error: "Missing deckId" }, { status: 400 });
  }
  const parsed = intakeSchema.safeParse(body.intake);
  if (!parsed.success) {
    return Response.json(
      { error: "Incomplete intake", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const deck = await db.deck.findUnique({
    where: { id: body.deckId },
    select: { id: true, projectId: true },
  });
  if (!deck) return Response.json({ error: "Deck not found" }, { status: 404 });

  // Ground the generation in everything the project has gathered.
  const sources = await getSourcesContext(deck.projectId);
  const grounding = sources.text;

  const generated = await generateDeck(parsed.data, grounding);

  await db.deck.update({
    where: { id: deck.id },
    data: {
      title: generated.title,
      slides: asJson(generated.slides),
      stage: "draft",
      feedback: Prisma.JsonNull,
    },
  });

  return Response.json({ ok: true, title: generated.title, slides: generated.slides });
}
