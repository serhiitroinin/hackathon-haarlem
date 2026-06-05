"use client";

import {
  NoteCreatedCard,
  type NoteCreatedOutput,
} from "~/components/chat/generative/note-created-card";
import {
  NotesSummaryCard,
  type NotesSummaryOutput,
} from "~/components/chat/generative/notes-summary-card";

/**
 * Generative-UI registry: maps a tool name to the component that renders its
 * output. This is the whole pattern — the model picks a tool, and the app
 * decides what UI that result becomes. Add a tool here to give it a visual.
 */
const renderers: Record<string, (output: unknown) => React.ReactNode> = {
  createNote: (output) => <NoteCreatedCard {...(output as NoteCreatedOutput)} />,
  summarizeNotes: (output) => (
    <NotesSummaryCard {...(output as NotesSummaryOutput)} />
  ),
};

/** Returns a generative component for a completed tool, or null to fall back. */
export function renderToolOutput(
  toolName: string,
  output: unknown,
): React.ReactNode | null {
  return renderers[toolName]?.(output) ?? null;
}
