import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getModel } from "~/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const questionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().describe("snake_case identifier, unique per question"),
        question: z.string().describe("One-sentence open-ended question"),
      }),
    )
    .min(3)
    .max(6),
});

export async function POST(req: Request) {
  const body = (await req.json()) as {
    topic: string;
    audience: string;
    level: string;
    duration?: string;
    objective?: string;
    fileNames?: string[];
  };

  const contextLines = [
    `Topic: ${body.topic}`,
    `Audience: ${body.audience}`,
    `Level: ${body.level}`,
    body.duration ? `Duration: ${body.duration}` : null,
    body.objective ? `Objective: ${body.objective}` : null,
    body.fileNames?.length ? `Reference materials: ${body.fileNames.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { object } = await generateObject({
    model: getModel(),
    schema: questionsSchema,
    system: `You are a training design expert. Generate 4–5 targeted follow-up questions that help a trainer produce a more relevant and specific training deck. Questions must be directly tied to the topic, audience, and level provided. Each question should be one concise sentence, open-ended, and uncover context that shapes slide content — things like prior knowledge gaps, real tools used, common mistakes, or memorable examples from their workplace.`,
    prompt: `${contextLines}\n\nGenerate 4–5 follow-up questions to refine this training deck.`,
  });

  return NextResponse.json(object);
}
