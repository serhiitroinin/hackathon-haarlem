import { ProjectSidebar } from "~/components/projects/project-sidebar";

// Shared shell for the project-centric app: a persistent sidebar (project list +
// creation wizard) alongside the active view. The sidebar survives navigation
// between the hub (/) and a project (/projects/[id]).
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectSidebar />
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
