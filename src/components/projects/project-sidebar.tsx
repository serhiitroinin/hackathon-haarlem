"use client";

import { FolderOpen, GraduationCap, Layers, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { ProjectWizard } from "~/components/projects/project-wizard";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function ProjectSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const utils = api.useUtils();
  const projects = api.project.list.useQuery();

  const del = api.project.delete.useMutation({
    onSuccess: async (_d, vars) => {
      await utils.project.list.invalidate();
      if (pathname === `/projects/${vars.id}`) router.push("/");
    },
  });

  const activeId = pathname.startsWith("/projects/")
    ? pathname.split("/")[2]
    : null;

  return (
    <aside className="bg-muted/30 flex h-screen w-72 shrink-0 flex-col border-r">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Sparkles className="h-4 w-4" />
        </span>
        <Link href="/" className="text-sm font-bold tracking-tight">
          Maverx Studio
        </Link>
      </div>

      <div className="px-3">
        <ProjectWizard />
      </div>

      {/* Project list */}
      <div className="text-muted-foreground mt-5 mb-1 flex items-center gap-1.5 px-4 text-xs font-medium tracking-wide uppercase">
        <Layers className="h-3.5 w-3.5" /> Projects
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-1">
          {projects.isLoading && (
            <div className="space-y-2 px-2 py-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}
          {projects.data?.length === 0 && (
            <p className="text-muted-foreground px-2 py-6 text-center text-xs">
              No projects yet. Create one to get started.
            </p>
          )}
          {projects.data?.map((p) => {
            const active = p.id === activeId;
            return (
              <div
                key={p.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                )}
              >
                <Link
                  href={`/projects/${p.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <FolderOpen className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  {p.sourceCount > 0 && (
                    <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]">
                      {p.sourceCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Delete project “${p.title}” and its sources?`))
                      del.mutate({ id: p.id });
                  }}
                  className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-3 py-3">
        <Link href="/maverx">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Training Builder
          </Button>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
