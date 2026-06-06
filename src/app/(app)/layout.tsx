import { ProjectSidebar } from "~/components/projects/project-sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

// Project-centric shell: a shadcn collapsible sidebar (project list + creation
// wizard) alongside the active view. Collapse with the rail, the header trigger,
// or ⌘/Ctrl+B; the state persists in a cookie.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <ProjectSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">{children}</SidebarInset>
    </SidebarProvider>
  );
}
