import { type AccentKey } from "~/components/builder/tokens";
import { type SlideKind } from "~/components/builder/types";
import { type Block, type Intake } from "./schema";

/**
 * The Maverx training framework — the DIDACTIC ENGINE.
 *
 *   TRAINING = Kick-off + [ Module₁ … Moduleₙ ] + Wrap-up
 *   MODULE   = Theory(1–3) + Example(1) + Exercise(1)
 *
 * Principle: STRUCTURE IS COMPUTED (this file, deterministic), CONTENT IS
 * GENERATED (generate-deck.ts, LLM). The model never decides module/slide count
 * or timing — it fills text into the fixed scaffold this module produces.
 */

// §1b — minutes per Theory→Example→Exercise loop, by level.
const MIN_PER_MODULE: Record<Intake["level"], number> = {
  beginner: 40,
  intermediate: 32,
  advanced: 26,
};
// §1c — Theory slides per module, by level (beginner = fewer/slower).
const THEORY_SLIDES: Record<Intake["level"], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export type Budget = {
  total: number;
  kickoff: number;
  wrapup: number;
  breaks: number;
  content: number;
  modules: number;
  minutesPerModule: number;
  theoryPerModule: number;
};

/** §1 — Intake → Training Budget. Pure arithmetic, no LLM. */
export function computeBudget(intake: Intake): Budget {
  const total = intake.durationMinutes;
  const kickoff = Math.max(10, Math.round(total * 0.08));
  const wrapup = Math.max(10, Math.round(total * 0.07));
  const breaks = total >= 90 ? Math.floor(total / 90) * 10 : 0;
  const content = Math.max(20, total - kickoff - wrapup - breaks);
  const mpm = MIN_PER_MODULE[intake.level];
  const modules = Math.min(8, Math.max(1, Math.round(content / mpm)));
  return {
    total,
    kickoff,
    wrapup,
    breaks,
    content,
    modules,
    minutesPerModule: Math.round(content / modules),
    theoryPerModule: THEORY_SLIDES[intake.level],
  };
}

/** One slide slot in the computed scaffold — block, layout kind, computed time. */
export type Slot = {
  block: Block;
  kind: SlideKind;
  /** Computed minutes for this slide (sums ≈ to total − breaks). */
  minutes: number;
  /** 1-based module index for theory/example/exercise slots. */
  module?: number;
  /** What the LLM should put here. */
  hint: string;
};

const ACCENT_BY_BLOCK: Record<Block, AccentKey> = {
  kickoff: "purple",
  theory: "purple",
  example: "teal",
  exercise: "orange",
  wrapup: "rose",
};

export function accentForBlock(block: Block): AccentKey {
  return ACCENT_BY_BLOCK[block];
}

/** §2/§3 — expand a budget into the ordered list of slide slots to fill. */
export function buildScaffold(budget: Budget): Slot[] {
  const slots: Slot[] = [];

  // Kick-off: Title · Agenda · Objectives (share the kickoff time).
  slots.push({ block: "kickoff", kind: "cover", minutes: 2, hint: "Title slide: training title + a subtitle naming the audience and duration." });
  slots.push({ block: "kickoff", kind: "agenda", minutes: 3, hint: "Agenda: the module names in teaching order (one per module)." });
  slots.push({
    block: "kickoff",
    kind: "content",
    minutes: Math.max(2, budget.kickoff - 5),
    hint: "Learning objectives: 3–5 outcome statements ('After this you can…') + a one-line 'why this matters' hook.",
  });

  // Modules: Theory(1–3) → Example(1) → Exercise(1).
  const exampleMin = 3;
  const theoryMin = 2;
  const exerciseMin = Math.max(
    8,
    budget.minutesPerModule - budget.theoryPerModule * theoryMin - exampleMin,
  );
  for (let m = 1; m <= budget.modules; m++) {
    for (let t = 0; t < budget.theoryPerModule; t++) {
      slots.push({
        block: "theory",
        kind: "content",
        minutes: theoryMin,
        module: m,
        hint: `Module ${m} theory: ONE concept — definition + key components, ≤5 bullets (≤12 words each) or a small 2-col table. No paragraphs.`,
      });
    }
    slots.push({
      block: "example",
      kind: "example",
      minutes: exampleMin,
      module: m,
      hint: `Module ${m} example: one named, recognizable worked illustration from the audience's real world that applies the theory just taught.`,
    });
    slots.push({
      block: "exercise",
      kind: "exercise",
      minutes: exerciseMin,
      module: m,
      hint: `Module ${m} exercise: an active task applying that theory — state task · format (solo/pair/group) · time · deliverable · success criteria.`,
    });
  }

  // Wrap-up.
  slots.push({
    block: "wrapup",
    kind: "wrapup",
    minutes: budget.wrapup,
    hint: "Wrap-up: 3 key takeaways tied back to the objectives + next steps and a pointer to the post-bite.",
  });

  return slots;
}

/** Human summary of the computed plan (for the intake confirmation / UI). */
export function describeBudget(budget: Budget): string {
  return (
    `${budget.modules} module${budget.modules === 1 ? "" : "s"} · ` +
    `${budget.theoryPerModule} theory slide${budget.theoryPerModule === 1 ? "" : "s"}/module · ` +
    `${budget.minutesPerModule} min/module · ` +
    `kickoff ${budget.kickoff}m · wrap-up ${budget.wrapup}m` +
    (budget.breaks ? ` · ${budget.breaks}m breaks` : "")
  );
}
