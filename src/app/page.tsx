import { Boxes, Sparkles } from "lucide-react";

import { ThemeToggle } from "~/components/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { Workspace } from "~/components/workspace";
import { HydrateClient, api } from "~/trpc/server";

// Data-driven page (server-side tRPC prefetch reads request headers), so render
// it dynamically instead of trying to prerender at build time.
export const dynamic = "force-dynamic";

export default function Home() {
  // Warm the cache so the first client render has data.
  void api.note.list.prefetch();
  void api.note.countByDay.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Hackathon Haarlem — Starter
              </h1>
              <p className="text-muted-foreground text-sm">
                Next.js · tRPC · Prisma · shadcn · AI SDK · MapLibre · Recharts · Tiptap
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <Boxes className="mr-1 h-3 w-3" /> rip out what you need
            </Badge>
            <ThemeToggle />
          </div>
        </header>

        <Workspace />
      </main>
    </HydrateClient>
  );
}
