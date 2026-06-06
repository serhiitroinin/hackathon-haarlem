import { deckRouter } from "~/server/api/routers/deck";
import { driveRouter } from "~/server/api/routers/drive";
import { noteRouter } from "~/server/api/routers/note";
import { projectRouter } from "~/server/api/routers/project";
import { sourceRouter } from "~/server/api/routers/source";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  deck: deckRouter,
  drive: driveRouter,
  note: noteRouter,
  project: projectRouter,
  source: sourceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.note.list();
 */
export const createCaller = createCallerFactory(appRouter);
