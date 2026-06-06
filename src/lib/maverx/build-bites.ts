import "server-only";

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import type { Bite, TrainingPlan } from "./schema";

function biteDoc(bite: Bite, trainingTitle: string, kicker: string): Document {
  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: kicker.toUpperCase(), bold: true, size: 20 })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            text: bite.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `For the training: ${trainingTitle}`, italics: true, color: "666666" }),
            ],
            spacing: { after: 240 },
          }),
          new Paragraph({ text: bite.intro, spacing: { after: 240 } }),
          ...bite.items.map(
            (item) =>
              new Paragraph({
                text: item,
                bullet: { level: 0 },
                spacing: { after: 120 },
              }),
          ),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 480 },
            children: [new TextRun({ text: "Maverx", bold: true, color: "999999", size: 18 })],
          }),
        ],
      },
    ],
  });
}

export type BiteFiles = {
  preBite: Buffer;
  postBite: Buffer;
};

/** Produce the pre-bite and post-bite as separate editable .docx buffers. */
export async function buildBites(plan: TrainingPlan): Promise<BiteFiles> {
  const [preBite, postBite] = await Promise.all([
    Packer.toBuffer(biteDoc(plan.preBite, plan.title, "Pre-bite · before the session")),
    Packer.toBuffer(biteDoc(plan.postBite, plan.title, "Post-bite · after the session")),
  ]);
  return { preBite, postBite };
}
