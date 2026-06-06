import "server-only";

import { db } from "~/server/db";

/** Total characters of source text we inject as context. Keeps prompts bounded
 * so a few large PDFs don't blow the model's context window or the bill. */
const CONTEXT_CHAR_BUDGET = 60_000;

export type SourceContext = {
  /** Concatenated, labelled, budget-trimmed text from all uploaded sources. */
  text: string;
  /** How many sources contributed any text. */
  count: number;
  /** True if we hit the budget and dropped some content. */
  truncated: boolean;
};

/**
 * Build the shared "context for the next steps": all uploaded documents' extracted
 * text, concatenated with clear per-document headers and trimmed to a budget.
 * Used by the ingest chat (to answer about the docs) and the Maverx pipeline
 * (so generated training is informed by the uploaded material).
 */
export async function getSourcesContext(
  projectId?: string,
): Promise<SourceContext> {
  const sources = await db.source.findMany({
    where: { text: { not: "" }, ...(projectId ? { projectId } : {}) },
    orderBy: { createdAt: "asc" },
    select: { name: true, text: true },
  });

  let used = 0;
  let truncated = false;
  const parts: string[] = [];

  // The project's free-text initial context (from the creation wizard) leads.
  if (projectId) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { context: true },
    });
    const ctx = project?.context?.trim();
    if (ctx) {
      const block = `--- Project context ---\n${ctx}`;
      parts.push(block.slice(0, CONTEXT_CHAR_BUDGET));
      used += Math.min(block.length, CONTEXT_CHAR_BUDGET);
    }
  }

  let docCount = 0;
  for (const s of sources) {
    const remaining = CONTEXT_CHAR_BUDGET - used;
    if (remaining <= 0) {
      truncated = true;
      break;
    }
    const header = `--- Document: ${s.name} ---\n`;
    let body = s.text;
    if (header.length + body.length > remaining) {
      body = body.slice(0, Math.max(0, remaining - header.length));
      truncated = true;
    }
    parts.push(header + body);
    used += header.length + body.length;
    docCount++;
  }

  return { text: parts.join("\n\n"), count: docCount, truncated };
}
