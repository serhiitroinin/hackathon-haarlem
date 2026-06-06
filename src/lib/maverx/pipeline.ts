import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSourcesContext } from "~/lib/sources";

import { buildBites } from "./build-bites";
import { buildPptx } from "./build-pptx";
import { generateTrainingPlan } from "./generate-content";
import { arcPresent, type Intake } from "./schema";

export type GeneratedFile = { name: string; url: string };

export type TrainingResult = {
  id: string;
  title: string;
  slideCount: number;
  arcComplete: boolean;
  meta: Intake;
  files: { pptx: GeneratedFile; preBite: GeneratedFile; postBite: GeneratedFile };
};

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "training"
  );
}

/**
 * End-to-end: intake -> structured plan -> editable .pptx (from the Maverx master)
 * + pre/post-bite .docx files written under public/generated/<id>/, ready to download.
 * Shared by the chat tool and the standalone /api/generate-training route.
 */
export async function generateTrainingFiles(intake: Intake): Promise<TrainingResult> {
  // Fold any documents uploaded on the first screen into the intake context, so
  // the generated training is grounded in the trainer's own source material.
  const sources = await getSourcesContext();
  const merged: Intake = sources.count
    ? {
        ...intake,
        context: [
          intake.context,
          `Source material from ${sources.count} uploaded document(s)` +
            `${sources.truncated ? " (truncated)" : ""}:\n${sources.text}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      }
    : intake;

  const plan = await generateTrainingPlan(merged);
  // Keep the returned meta to the original intake — don't echo the (large) source
  // material back over the wire to the chat card.
  plan.meta = intake;
  const [pptx, bites] = await Promise.all([buildPptx(plan), buildBites(plan)]);

  const id = randomUUID().slice(0, 8);
  const base = slug(plan.title);
  const dir = path.join(process.cwd(), "public", "generated", id);
  await mkdir(dir, { recursive: true });

  const files = {
    pptx: { name: `${base}.pptx`, url: `/generated/${id}/${base}.pptx` },
    preBite: { name: `${base}-pre-bite.docx`, url: `/generated/${id}/${base}-pre-bite.docx` },
    postBite: { name: `${base}-post-bite.docx`, url: `/generated/${id}/${base}-post-bite.docx` },
  };

  await Promise.all([
    writeFile(path.join(dir, files.pptx.name), pptx),
    writeFile(path.join(dir, files.preBite.name), bites.preBite),
    writeFile(path.join(dir, files.postBite.name), bites.postBite),
  ]);

  return {
    id,
    title: plan.title,
    slideCount: plan.slides.length + 2, // + title + agenda
    arcComplete: arcPresent(plan.slides),
    meta: plan.meta,
    files,
  };
}
