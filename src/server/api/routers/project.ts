import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Projects are the top-level entity — one organization case. The sidebar lists
 * them; everything else (sources, chat) is scoped to one. `list` is lightweight
 * (includes a source count for the sidebar badge), `byId` returns the full record.
 */
export const projectRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { sources: true } },
      },
    });
    return projects.map(({ _count, ...p }) => ({ ...p, sourceCount: _count.sources }));
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.project.findUnique({ where: { id: input.id } });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Give the project a title"),
        context: z.string().default(""),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.project.create({ data: input });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        context: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.project.update({ where: { id }, data });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      // Sources cascade-delete via the relation.
      return ctx.db.project.delete({ where: { id: input.id } });
    }),
});
