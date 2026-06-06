import "server-only";

import { generateObject } from "ai";

import { getContentModel } from "~/lib/ai";
import {
  slideBudget,
  trainingPlanSchema,
  type Intake,
  type TrainingPlan,
} from "./schema";

const SYSTEM = `You are a senior instructional designer producing corporate training
material for Maverx. You output a COMPLETE, ready-to-teach training as structured data.

NON-NEGOTIABLE RULES:
1. Follow the Maverx didactic model exactly, in this order:
   kickoff → theory → example → exercise → wrapup.
   - kickoff: title + agenda + the learning goals (2 slides is fine).
   - For each core concept, pair THEORY with a recognizable EXAMPLE and an active
     EXERCISE (individual/pair/group). Exercises must apply the theory just taught.
   - wrapup: key takeaways, link to practice, next steps.
2. EVERY slide needs speaker notes with ALL 5 fields filled with real content:
   aim, time, instructions (steps), reflectiveQuestion, debrief. Timings across
   slides must roughly add up to the requested training length.
3. Body content is concise editable bullets (3–6 per slide), tone and depth matched
   to the audience and knowledge level. Use a table ONLY where it genuinely helps
   (e.g. comparisons, do/don't, step matrices). Never describe images or screenshots.
4. A real trainer must be able to teach the session straight from this — practical,
   specific, domain-accurate. No filler, no lorem ipsum, no "TBD".
5. Produce a pre-bite (preparation before the session: a reading, a setup task, or a
   reflection) and a post-bite (after the session: reflection, an assignment, or
   further reading). Each is a short intro + concrete items.`;

/** Generate a full Tier-1 training plan from the completed intake. */
export async function generateTrainingPlan(intake: Intake): Promise<TrainingPlan> {
  const target = slideBudget(intake.durationMinutes);

  const { object } = await generateObject({
    model: getContentModel(),
    schema: trainingPlanSchema,
    system: SYSTEM,
    prompt: `Create a single complete training.

Topic / skill: ${intake.topic}
Target audience: ${intake.audience}
Knowledge level: ${intake.level}
Total length: ${intake.durationMinutes} minutes
Primary learning objective: ${intake.objective}
${intake.context ? `Extra context: ${intake.context}` : ""}

Aim for about ${target} slides total. Set meta to exactly the intake values above.
Make the example(s) concrete and recognizable for this audience, and make every
exercise an active application of the immediately preceding theory.`,
  });

  // The model must echo the intake into meta; enforce it so downstream is exact.
  object.meta = intake;
  return object;
}
