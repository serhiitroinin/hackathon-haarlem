import { notFound } from "next/navigation";

import { ProjectWorkspace } from "~/components/projects/project-workspace";
import { HydrateClient, api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 404 on unknown ids; otherwise warm the queries the workspace reads.
  const project = await api.project.byId({ id });
  if (!project) notFound();

  void api.project.byId.prefetch({ id });
  void api.source.list.prefetch({ projectId: id });

  return (
    <HydrateClient>
      <ProjectWorkspace projectId={id} />
    </HydrateClient>
  );
}
