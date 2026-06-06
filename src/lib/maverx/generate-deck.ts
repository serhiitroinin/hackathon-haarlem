import "server-only";

import { generateObject } from "ai";
import { z } from "zod";

import { type Slide } from "~/components/builder/types";
import { getContentModel, getFastModel } from "~/lib/ai";
import {
  accentForBlock,
  buildScaffold,
  computeBudget,
  describeBudget,
  type Budget,
} from "./framework";
import { type Intake } from "./schema";

/**
 * Generate a draft deck from intake + grounding, following the computed framework
 * scaffold. STRUCTURE is deterministic (framework.ts); CONTENT is the LLM.
 *
 * Speed: heavily PARALLEL. One small kick-off/outline call, then every module's
 * theory / example / exercise AND the wrap-up are filled as ~13 tiny concurrent
 * calls. Wall-clock ≈ the slowest 1–2-slide call, not the whole deck (a single
 * giant call was ~3 min).
 */

const notes = z.object({
  aim: z.string(),
  instructions: z.string(),
  keyPoints: z.string(),
  linkToReality: z.string(),
  debrief: z.string(),
});
type Notes = z.infer<typeof notes>;

const fill = z.object({
  title: z.string(),
  eyebrow: z.string().optional(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  notes,
});
type Fill = z.infer<typeof fill>;

const blankNotes: Notes = {
  aim: "",
  instructions: "",
  keyPoints: "",
  linkToReality: "",
  debrief: "",
};
const placeholder = (title: string): Fill => ({ title, notes: blankNotes });

const RULES = `Keep titles tight (≤8 words; 33pt). Bullets concise: ≤6 per slide,
≤12 words each, one idea per slide, no paragraphs, no images-of-text. Write plain
text — NO markdown or "**" markers. Avoid "/" — write "and"/"or". Fill ALL note fields (do NOT set time —
it is computed). Ground content in the provided material; don't invent specific facts.`;

const brief = (i: Intake) =>
  `Topic: ${i.topic}\nAudience: ${i.audience}\nLevel: ${i.level}\nObjective: ${i.objective}`;

// Set true once the fast model is found unavailable in a run (e.g. OpenRouter
// data-policy blocks it) so we stop wasting an attempt on every remaining fill.
let fastBlocked = false;

/** Generic "fill N slides" call. Prefers the FAST model (high volume); if it's
 * unavailable, falls back to the content model AND skips the fast model for the
 * rest of the run, so generation never produces empty slides or wastes attempts. */
async function genSlides(system: string, prompt: string): Promise<Fill[]> {
  const schema = z.object({ slides: z.array(fill) });
  const models = fastBlocked ? [getContentModel()] : [getFastModel(), getContentModel()];
  for (let i = 0; i < models.length; i++) {
    try {
      const { object } = await generateObject({ model: models[i]!, schema, system, prompt });
      return object.slides;
    } catch (e) {
      if (i === 0 && !fastBlocked) fastBlocked = true; // fast model is out — stop trying it
      console.warn("[genSlides] model failed, falling back:", e instanceof Error ? e.message : e);
    }
  }
  return [];
}

/** Phase 1 — kick-off + module outline (one small call). */
async function genKickoff(intake: Intake, budget: Budget, grounding: string) {
  const schema = z.object({
    deckTitle: z.string(),
    cover: fill,
    agenda: fill.describe("Agenda slide: a short title + speaker notes (the list itself is built from the modules)"),
    objectives: fill.describe("3–5 'After this you can…' outcomes as bullets"),
    modules: z
      .array(z.object({ title: z.string(), focus: z.string() }))
      .describe(`Modules in teaching order (aim for ${budget.modules})`),
  });
  const { object } = await generateObject({
    model: getContentModel(),
    schema,
    system: `You design a Maverx training kick-off and outline. ${RULES}`,
    prompt: `${brief(intake)}\nPlanned: ${describeBudget(budget)}\n${
      grounding ? `Source material to ground in:\n${grounding}\n` : ""
    }\nProduce: a deck title, the cover slide (title + subtitle naming audience and duration), an objectives slide (3–5 outcome bullets), and about ${budget.modules} module outlines (title + one-line focus), sequenced sensibly (follow the source's own phase order if it has one).`,
  });
  return object;
}

export type GenProgress = { stage: string; done: number; total: number };

export async function generateDeck(
  intake: Intake,
  groundingRaw: string,
  onProgress?: (p: GenProgress) => void,
): Promise<{ title: string; slides: Slide[] }> {
  const budget = computeBudget(intake);
  const scaffold = buildScaffold(budget);
  const grounding = groundingRaw.slice(0, 9000);
  const sys = `You write training slides for a Maverx deck. ${RULES}`;
  const ctx = grounding ? `\nSource material:\n${grounding}\n` : "";

  // Real progress: 1 outline step + 3 fills/module + 1 wrap-up.
  const total = 1 + budget.modules * 3 + 1;
  let doneCount = 0;
  const tick = (stage: string) => {
    doneCount += 1;
    onProgress?.({ stage, done: doneCount, total });
  };
  onProgress?.({ stage: "Planning the training outline", done: 0, total });

  // Phase 1: outline + kick-off. Concurrently probe the fast model with a tiny
  // call — it overlaps the (slower) kick-off, so it's "free", and it trips
  // `fastBlocked` before the module burst so we never waste 12 attempts on a
  // blocked model (e.g. OpenRouter data-policy).
  fastBlocked = false;
  const probe = generateObject({
    model: getFastModel(),
    schema: z.object({ ok: z.string() }),
    prompt: "Reply with ok set to 'ok'.",
  }).catch(() => {
    fastBlocked = true;
  });
  const kickoff = await genKickoff(intake, budget, grounding);
  await probe;
  tick("Outline ready — writing slides");

  const mods = kickoff.modules.slice(0, budget.modules);
  while (mods.length < budget.modules)
    mods.push({ title: `Module ${mods.length + 1}`, focus: intake.topic });

  const byModule = mods.map(() => ({
    theory: [] as Fill[],
    example: [] as Fill[],
    exercise: [] as Fill[],
  }));
  let wrapup: Fill = placeholder("Wrap-up");

  // Phase 2: theory / example / exercise per module + wrap-up — ALL in parallel.
  await Promise.all([
    ...mods.flatMap((m, i) => {
      const head = `${brief(intake)}${ctx}\nModule ${i + 1}: "${m.title}" — ${m.focus}`;
      return [
        genSlides(
          sys,
          `${head}\nProduce ${budget.theoryPerModule} THEORY slide(s): each one concept — definition + key components.`,
        ).then((s) => {
          byModule[i]!.theory = s;
          tick(`Module ${i + 1}: theory`);
        }),
        genSlides(
          sys,
          `${head}\nProduce 1 EXAMPLE slide: a named, recognizable worked illustration from the audience's world applying this theory.`,
        ).then((s) => {
          byModule[i]!.example = s;
          tick(`Module ${i + 1}: example`);
        }),
        genSlides(
          sys,
          `${head}\nProduce 1 EXERCISE slide: an active task applying this theory — task, format (solo/pair/group), time, deliverable, success criteria.`,
        ).then((s) => {
          byModule[i]!.exercise = s;
          tick(`Module ${i + 1}: exercise`);
        }),
      ];
    }),
    genSlides(
      sys,
      `${brief(intake)}\nModules: ${mods.map((m) => m.title).join("; ")}\nProduce 1 WRAP-UP slide: 3 key takeaways tied to the objective + next steps and a pointer to the post-bite.`,
    ).then((s) => {
      if (s[0]) wrapup = s[0];
      tick("Wrap-up & takeaways");
    }),
  ]);

  // Assemble in deterministic scaffold order; inject computed time.
  const ptr = mods.map(() => ({ theory: 0, example: 0, exercise: 0 }));
  const slides: Slide[] = scaffold.map((slot, i) => {
    let f: Fill;
    if (slot.kind === "cover") f = kickoff.cover;
    else if (slot.kind === "agenda") f = kickoff.agenda;
    else if (slot.block === "kickoff") f = kickoff.objectives;
    else if (slot.block === "wrapup") f = wrapup;
    else {
      const mi = (slot.module ?? 1) - 1;
      const bucket = byModule[mi]?.[slot.block as "theory" | "example" | "exercise"];
      const p = ptr[mi]![slot.block as "theory" | "example" | "exercise"]++;
      f = bucket?.[p] ?? placeholder(slot.hint.split(":")[0]!);
    }

    const eyebrow =
      f.eyebrow ??
      (slot.module
        ? `Module ${slot.module} · ${slot.block[0]!.toUpperCase()}${slot.block.slice(1)}`
        : undefined);

    return {
      id: `s-${i + 1}`,
      kind: slot.kind,
      accent: accentForBlock(slot.block),
      eyebrow,
      title: f.title,
      subtitle: slot.kind === "cover" ? f.subtitle : undefined,
      bullets: slot.kind === "agenda" ? undefined : f.bullets,
      agenda: slot.kind === "agenda" ? mods.map((m) => ({ label: m.title })) : undefined,
      notes: {
        aim: f.notes.aim,
        time: `${slot.minutes} min`, // COMPUTED
        instructions: f.notes.instructions,
        keyPoints: f.notes.keyPoints,
        linkToReality: f.notes.linkToReality,
        debrief: f.notes.debrief,
      },
      overrides: {},
      comments: [],
    } satisfies Slide;
  });

  return { title: kickoff.deckTitle || intake.topic, slides };
}
