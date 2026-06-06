import { FolderPlus, Sparkles } from "lucide-react";

import { HydrateClient, api } from "~/trpc/server";

// Reads request headers via tRPC prefetch -> dynamic, not prerendered.
export const dynamic = "force-dynamic";

export default function Hub() {
  // Warm the project list so the sidebar paints instantly.
  void api.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="bg-primary/10 text-primary mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Sparkles className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Start a project</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          A project is one organization case. It holds all the context, documents,
          and assets you work with. Create one from the sidebar, give it a title and
          some initial context, and attach any starting material.
        </p>
        <p className="text-muted-foreground mt-6 flex items-center gap-2 text-xs">
          <FolderPlus className="h-4 w-4" />
          Use “New project” in the sidebar to begin.
        </p>
      </div>
    </HydrateClient>
  );
}
