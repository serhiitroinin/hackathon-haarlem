import { z } from "zod";

import { driveMeta, FAKE_DRIVE } from "~/lib/google/fake-drive";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Fake Google Drive endpoints. `list` returns the mock corpus metadata for the
 * picker; `importToProject` turns selected files into project Sources (reusing
 * the same Source table the upload route writes to). No real Google calls.
 */
export const driveRouter = createTRPCRouter({
  list: publicProcedure.query(() => driveMeta()),

  importToProject: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { id: true },
      });
      if (!project) throw new Error("Project not found");

      const files = FAKE_DRIVE.filter((f) => input.fileIds.includes(f.id));
      let created = 0;
      for (const f of files) {
        await ctx.db.source.create({
          data: {
            projectId: input.projectId,
            name: f.name,
            kind: f.kind === "image" ? "image" : f.kind === "pdf" ? "pdf" : "text",
            mimeType: f.mimeType,
            bytes: f.sizeBytes,
            text: f.text,
            chars: f.text.length,
          },
        });
        created++;
      }
      return { created };
    }),
});
