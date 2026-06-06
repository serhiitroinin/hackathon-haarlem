import { z } from "zod";

import { SAMPLE_DECK } from "~/components/builder/sample-deck";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Prisma } from "~/server/db";

/**
 * A project's slide deck (a project asset). Stored as Slide[] JSON; snapshots
 * live in DeckVersion. `slides` is passed through as opaque JSON — the builder
 * owns its shape (see ~/components/builder/types).
 */
const asJson = (v: unknown) => v as Prisma.InputJsonValue;

export const deckRouter = createTRPCRouter({
  byProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.deck.findFirst({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "asc" },
      }),
    ),

  /** Return the project's deck, seeding one from the sample if none exists. */
  getOrCreate: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.deck.findFirst({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "asc" },
      });
      if (existing) return existing;
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { title: true },
      });
      return ctx.db.deck.create({
        data: {
          projectId: input.projectId,
          title: project?.title ? `${project.title} — training` : SAMPLE_DECK.title,
          slides: asJson(SAMPLE_DECK.slides),
        },
      });
    }),

  save: publicProcedure
    .input(
      z.object({
        deckId: z.string(),
        title: z.string().optional(),
        slides: z.unknown(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.deck.update({
        where: { id: input.deckId },
        data: {
          ...(input.title ? { title: input.title } : {}),
          slides: asJson(input.slides),
        },
      }),
    ),

  /** Snapshot the current deck slides into a named version. */
  snapshot: publicProcedure
    .input(z.object({ deckId: z.string(), label: z.string().default("") }))
    .mutation(async ({ ctx, input }) => {
      const deck = await ctx.db.deck.findUnique({ where: { id: input.deckId } });
      if (!deck) throw new Error("Deck not found");
      return ctx.db.deckVersion.create({
        data: { deckId: deck.id, label: input.label, slides: asJson(deck.slides) },
      });
    }),

  versions: publicProcedure
    .input(z.object({ deckId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.deckVersion.findMany({
        where: { deckId: input.deckId },
        orderBy: { createdAt: "desc" },
        select: { id: true, label: true, createdAt: true },
      }),
    ),

  restore: publicProcedure
    .input(z.object({ deckId: z.string(), versionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const v = await ctx.db.deckVersion.findUnique({
        where: { id: input.versionId },
      });
      if (!v) throw new Error("Version not found");
      return ctx.db.deck.update({
        where: { id: input.deckId },
        data: { slides: asJson(v.slides) },
      });
    }),
});
