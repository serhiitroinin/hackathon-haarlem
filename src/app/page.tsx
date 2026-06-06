import { FlaskConical, GraduationCap, Sparkles } from "lucide-react";
import Link from "next/link";

import { SourcesScreen } from "~/components/sources/sources-screen";
import { ThemeToggle } from "~/components/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { HydrateClient, api } from "~/trpc/server";

// Reads request headers via tRPC prefetch -> render dynamically, not at build.
export const dynamic = "force-dynamic";

export default function Home() {
  // Warm the cache so the sources list paints instantly on first client render.
  void api.source.list.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Maverx — Source Intake
              </h1>
              <p className="text-muted-foreground text-sm">
                Upload your material, extract the knowledge, build the training.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/maverx">
              <Badge className="cursor-pointer">
                <GraduationCap className="mr-1 h-3 w-3" /> Training Builder
              </Badge>
            </Link>
            <Link href="/playground">
              <Badge variant="secondary" className="hidden cursor-pointer sm:inline-flex">
                <FlaskConical className="mr-1 h-3 w-3" /> Playground
              </Badge>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <SourcesScreen />
      </main>
    </HydrateClient>
  );
}
