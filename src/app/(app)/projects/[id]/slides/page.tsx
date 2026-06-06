import { notFound } from "next/navigation";

import { SlideBuilder } from "~/components/builder/slide-builder";
import {
  type DeckStage,
  type FeedbackMsg,
  type Slide,
} from "~/components/builder/types";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function ProjectSlidesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await api.project.byId({ id });
  if (!project) notFound();

  // Seed the project's deck on first visit, then hand it to the builder.
  const deck = await api.deck.getOrCreate({ projectId: id });

  return (
    <SlideBuilder
      persistence={{ kind: "project", deckId: deck.id }}
      projectId={id}
      initialDeck={{
        title: deck.title,
        slides: deck.slides as unknown as Slide[],
        stage: (deck.stage as DeckStage) ?? "draft",
        feedback: (deck.feedback as unknown as FeedbackMsg[]) ?? [],
      }}
      backHref={`/projects/${id}`}
    />
  );
}
