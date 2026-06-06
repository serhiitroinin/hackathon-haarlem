"use client";

import { FolderOpen, Layers, Presentation, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ProjectWizard } from "~/components/projects/project-wizard";
import { ThemeToggle } from "~/components/theme-toggle";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import { api } from "~/trpc/react";

export function ProjectSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const utils = api.useUtils();
  const projects = api.project.list.useQuery();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const del = api.project.delete.useMutation({
    onSuccess: async (_d, vars) => {
      await utils.project.list.invalidate();
      if (pathname.startsWith(`/projects/${vars.id}`)) router.push("/");
    },
  });

  const activeId = pathname.startsWith("/projects/") ? pathname.split("/")[2] : null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2">
        <div className="flex items-center justify-between gap-1">
          {/* Wordmark already includes the M mark — shown only when expanded. */}
          <Link
            href="/"
            className="flex items-center overflow-hidden px-1 group-data-[collapsible=icon]:hidden"
          >
            <Image
              src="/maverx-logo-black.png"
              alt="Maverx"
              width={120}
              height={28}
              className="h-6 w-auto dark:hidden"
              priority
            />
            <Image
              src="/maverx-logo.png"
              alt="Maverx"
              width={120}
              height={28}
              className="hidden h-6 w-auto dark:block"
              priority
            />
          </Link>
          {/* Always visible so the sidebar can be reopened when collapsed. */}
          <SidebarTrigger />
        </div>
        <ProjectWizard collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent>
        {/* The project list is hidden in collapsed (icon) mode. */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>
            <Layers className="mr-1.5 h-3.5 w-3.5" /> Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.isLoading && (
                <div className="space-y-1.5 px-2 py-1">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              )}
              {projects.data?.length === 0 && (
                <p className="text-muted-foreground px-2 py-4 text-center text-xs group-data-[collapsible=icon]:hidden">
                  No projects yet.
                </p>
              )}
              {projects.data?.map((p) => (
                <SidebarMenuItem key={p.id}>
                  <SidebarMenuButton asChild isActive={p.id === activeId} tooltip={p.title}>
                    <Link href={`/projects/${p.id}`}>
                      <FolderOpen />
                      <span>{p.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {p.sourceCount > 0 && (
                    <SidebarMenuBadge>{p.sourceCount}</SidebarMenuBadge>
                  )}
                  <SidebarMenuAction
                    showOnHover
                    onClick={() => {
                      if (confirm(`Delete project “${p.title}” and its sources?`))
                        del.mutate({ id: p.id });
                    }}
                    aria-label="Delete project"
                  >
                    <Trash2 />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Slide Builder (sandbox)">
              <Link href="/builder">
                <Presentation />
                <span>Slide Builder</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-2 py-1">
              <span className="text-muted-foreground text-xs group-data-[collapsible=icon]:hidden">
                Theme
              </span>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
