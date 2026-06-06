import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Source documents uploaded on the first screen. Binary upload + extraction
 * happens in the /api/upload route handler (multipart); this router is the
 * typesafe read/manage surface the UI uses. The full `text` is intentionally
 * NOT returned by `list` (it can be large) — only a short preview.
 */
export const sourceRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const sources = await ctx.db.source.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          kind: true,
          mimeType: true,
          bytes: true,
          chars: true,
          createdAt: true,
          text: true,
        },
      });
      return sources.map(({ text, ...s }) => ({
        ...s,
        preview: text.slice(0, 240),
      }));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.source.delete({ where: { id: input.id } });
    }),

  clear: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.db.source.deleteMany({
        where: { projectId: input.projectId },
      });
      return { count };
    }),
});
