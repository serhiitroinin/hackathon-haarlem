import "server-only";

import { generateObject } from "ai";
import { z } from "zod";

import { type Slide, type SpeakerNotes } from "~/components/builder/types";
import { getContentModel } from "~/lib/ai";
import { type Deck } from "~/components/builder/types";

/**
 * Revise a draft deck against its inline comments + chat feedback. PER-SLIDE and
 * PARALLEL (wall-clock ≈ the slowest single slide, not a 3-min whole-deck call).
 * Slides with no global feedback and no comments are left untouched — so targeted
 * feedback only re-runs the slides it concerns.
 */

const revisionSchema = z.object({
  title: z.string(),
  eyebrow: z.string().optional(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional().describe("Plain text, no markdown/** markers"),
  agenda: z
    .array(z.object({ label: z.string(), desc: z.string().optional() }))
    .optional(),
  rows: z
    .array(z.object({ time: z.string(), module: z.string(), activities: z.string() }))
    .optional(),
  background: z
    .enum(["white", "offWhite", "bgLavender", "bgRose", "bgOrange"])
    .optional()
    .describe("Light-slide background tint (cover/section ignore it)"),
  notes: z.object({
    aim: z.string(),
    instructions: z.string(),
    keyPoints: z.string(),
    linkToReality: z.string(),
    debrief: z.string(),
  }),
});

const SYSTEM = `You revise ONE slide of a Maverx training deck against reviewer
feedback. Keep the slide's role and layout (kind). Keep titles tight (≤8 words,
33pt), bullets concise (≤6, ≤12 words, plain text — no "**" markers, no "/"). Fill all
five note fields. Only change what the feedback asks for; otherwise keep it close
to the original. If feedback asks for a background/colour change, set "background".`;

/** Strip UI-only fields before showing the slide to the model. */
function toContent(slide: Slide) {
  const { overrides: _o, comments: _c, ...rest } = slide;
  return rest;
}

async function reviseOne(slide: Slide, globalFeedback: string): Promise<Slide> {
  const comments = (slide.comments ?? []).map((c) => c.text.trim()).filter(Boolean);
  // Nothing to do for this slide → keep it, just drop its (consumed) comments.
  if (!globalFeedback && comments.length === 0) {
    return { ...slide, comments: [] };
  }

  const prompt =
    `Current slide:\n${JSON.stringify(toContent(slide), null, 2)}\n\n` +
    (globalFeedback ? `General feedback for the whole deck:\n${globalFeedback}\n\n` : "") +
    (comments.length ? `Comments pinned on THIS slide:\n- ${comments.join("\n- ")}\n\n` : "") +
    `Return the revised slide.`;

  try {
    const { object } = await generateObject({
      model: getContentModel(),
      schema: revisionSchema,
      system: SYSTEM,
      prompt,
    });
    const notes: SpeakerNotes = {
      aim: object.notes.aim,
      time: slide.notes?.time ?? "", // computed time is preserved
      instructions: object.notes.instructions,
      keyPoints: object.notes.keyPoints,
      linkToReality: object.notes.linkToReality,
      debrief: object.notes.debrief,
    };
    return {
      ...slide,
      title: object.title,
      eyebrow: object.eyebrow ?? slide.eyebrow,
      subtitle: object.subtitle ?? slide.subtitle,
      bullets: object.bullets ?? slide.bullets,
      agenda: object.agenda ?? slide.agenda,
      rows: object.rows ?? slide.rows,
      background: object.background ?? slide.background,
      notes,
      overrides: {},
      comments: [],
    };
  } catch (e) {
    console.warn("[reviseOne] failed, keeping original:", e instanceof Error ? e.message : e);
    return { ...slide, comments: [] };
  }
}

export async function reviseSlides(deck: Deck): Promise<Slide[]> {
  const feedback = Array.isArray(deck.feedback) ? deck.feedback : [];
  const globalFeedback = feedback
    .filter((m) => m?.role === "user")
    .map((m) => m.text?.trim())
    .filter(Boolean)
    .join("\n");

  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  return Promise.all(slides.map((s) => reviseOne(s, globalFeedback)));
}
