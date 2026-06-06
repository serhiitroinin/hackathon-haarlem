import { z } from "zod";

/**
 * The Maverx didactic model — every training must follow this arc, no exceptions.
 * Each generated slide is tagged with the block it belongs to so we can both
 * validate the arc is present and pick the right master layout to clone.
 */
export const BLOCKS = [
  "kickoff", // set learning goals, introduce agenda
  "theory", // core concepts, explained for the audience
  "example", // concrete, recognizable illustration of the theory
  "exercise", // active application — individual / pair / group work
  "wrapup", // key takeaways, link to practice, next steps
] as const;
export type Block = (typeof BLOCKS)[number];

/** The 5 intake questions Maverx requires before any generation. */
export const intakeSchema = z.object({
  topic: z.string().min(1).describe("The topic or skill to be trained"),
  audience: z.string().min(1).describe("Who the target audience is"),
  level: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("Knowledge level of participants"),
  durationMinutes: z
    .number()
    .int()
    .positive()
    .describe("Total training length in minutes (drives module + slide count)"),
  objective: z.string().min(1).describe("The primary learning objective"),
  /** Anything useful gathered from follow-up questions on vague input. */
  context: z.string().optional().describe("Extra context from follow-up questions"),
});
export type Intake = z.infer<typeof intakeSchema>;

/** Speaker notes — Maverx requires ALL 5 fields on EVERY slide. */
export const speakerNotesSchema = z.object({
  aim: z.string().describe("1. Aim of the slide"),
  time: z.string().describe("2. Time indication, e.g. '5 min'"),
  instructions: z
    .array(z.string())
    .min(1)
    .describe("3. Instruction steps the trainer follows"),
  reflectiveQuestion: z.string().describe("4. A reflective question for learners"),
  debrief: z.string().describe("5. A debrief summary"),
});
export type SpeakerNotes = z.infer<typeof speakerNotesSchema>;

/** Optional editable table on a slide (kept as real text, never an image). */
export const tableSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const slideSchema = z.object({
  block: z.enum(BLOCKS),
  title: z.string(),
  /** Body bullets — editable text. Keep to ~3–6 per slide. */
  bullets: z.array(z.string()).default([]),
  table: tableSchema.optional(),
  notes: speakerNotesSchema,
});
export type Slide = z.infer<typeof slideSchema>;

/** A pre-bite / post-bite handout (produced as a separate editable .docx). */
export const biteSchema = z.object({
  title: z.string(),
  intro: z.string().describe("One short paragraph framing the document"),
  items: z.array(z.string()).describe("Concrete to-dos / reflections / readings"),
});
export type Bite = z.infer<typeof biteSchema>;

export const trainingPlanSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  meta: intakeSchema,
  agenda: z.array(z.string()).describe("Agenda lines for the kick-off slide"),
  slides: z.array(slideSchema).min(8),
  preBite: biteSchema,
  postBite: biteSchema,
});
export type TrainingPlan = z.infer<typeof trainingPlanSchema>;

/** Rough slide budget from duration — keeps Tier-1 decks in the ~20–30 range. */
export function slideBudget(durationMinutes: number): number {
  // ~1 content slide per 8 min of training, clamped to a sane Tier-1 range.
  return Math.min(30, Math.max(14, Math.round(durationMinutes / 8)));
}

/** Validate the didactic arc is actually present (used for self-checks/UI). */
export function arcPresent(slides: Slide[]): boolean {
  const present = new Set(slides.map((s) => s.block));
  return BLOCKS.every((b) => present.has(b));
}
