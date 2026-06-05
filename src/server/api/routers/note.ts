import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Full-stack typesafe slice: Zod-validated input -> Prisma -> typed output,
 * consumed on the client with zero manual types. This one router feeds the
 * map (lat/lng), the chart (createdAt), and the editor (content).
 */
export const noteRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.note.findMany({ orderBy: { createdAt: "desc" } });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.note.findUnique({ where: { id: input.id } });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title required"),
        content: z.string().default(""),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.note.create({ data: input });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.note.update({ where: { id }, data });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.note.delete({ where: { id: input.id } });
    }),

  /** Notes-per-day buckets for the chart demo. */
  countByDay: publicProcedure.query(async ({ ctx }) => {
    const notes = await ctx.db.note.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const buckets = new Map<string, number>();
    for (const n of notes) {
      const day = n.createdAt.toISOString().slice(0, 10);
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return Array.from(buckets, ([date, count]) => ({ date, count }));
  }),
});
