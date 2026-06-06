import "server-only";

import { generateObject } from "ai";
import { z } from "zod";

import { getContentModel } from "~/lib/ai";
import { type Deck, type FeedbackMsg, type Slide } from "~/components/builder/types";

/** Content-only slide schema the model revises (UI concerns like overrides and
 * comment pins are stripped before the call and not regenerated). */
const slideSchema = z.object({
  id: z.string().describe("Keep the original id when revising an existing slide"),
  kind: z.enum([
    "cover",
    "section",
    "agenda",
    "content",
    "example",
    "exercise",
    "wrapup",
    "timetable",
  ]),
  accent: z.enum(["purple", "rose", "orange", "teal"]),
  background: z
    .enum(["white", "offWhite", "bgLavender", "bgRose", "bgOrange"])
    .optional()
    .describe(
      "Light-slide background tint (cover/section ignore it): white | offWhite | bgLavender (lavender) | bgRose (rose) | bgOrange (orange)",
    ),
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional().describe("Use **word** to emphasise"),
  agenda: z
    .array(z.object({ label: z.string(), desc: z.string().optional() }))
    .optional(),
  rows: z
    .array(
      z.object({ time: z.string(), module: z.string(), activities: z.string() }),
    )
    .optional(),
  notes: z
    .object({
      aim: z.string(),
      time: z.string(),
      instructions: z.string(),
      keyPoints: z.string(),
      linkToReality: z.string(),
      debrief: z.string(),
    })
    .optional(),
});

const deckSchema = z.object({
  title: z.string(),
  slides: z.array(slideSchema).min(1),
});

const SYSTEM = `You are a senior instructional designer revising a Maverx training deck.
You receive the current draft as structured data plus reviewer feedback (inline
comments pinned to specific slides, and general chat feedback). Apply the feedback
faithfully and return the full revised deck.

Rules:
- Address every comment and feedback message; if feedback conflicts, prefer the
  most recent chat message.
- Keep each slide's "id" stable when you are revising that same slide so edits map
  back; only invent new ids for genuinely new slides.
- Preserve the Maverx didactic structure and tone. Keep titles tight (they render
  at 33pt), bullets concise (3-6 per slide), and fill ALL six speaker-note fields.
- Use **word** to emphasise key words in bullets. Don't use "/" — write "and"/"or".
- Keep "kind" and "accent" unless the feedback implies a change.
- If feedback asks to change a slide's background/colour, set "background" to one
  of: white, offWhite, bgLavender, bgRose, bgOrange (light slides only).`;

/** Strip UI-only fields the model shouldn't manage (keep `background` so the
 * model can see and change it). */
function toContent(slide: Slide) {
  const { overrides: _o, comments: _c, ...content } = slide;
  return content;
}

function feedbackBlock(deck: Deck): string {
  const commentLines: string[] = [];
  deck.slides.forEach((s, i) => {
    for (const c of s.comments ?? [])
      commentLines.push(`- Slide ${i + 1} ("${s.title}"): ${c.text}`);
  });
  const chat = (deck.feedback ?? [])
    .filter((m) => m.role === "user")
    .map((m) => `- ${m.text}`);

  return [
    commentLines.length ? `Inline comments:\n${commentLines.join("\n")}` : "",
    chat.length ? `Chat feedback:\n${chat.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n") || "(no explicit feedback — tighten and polish the deck)";
}

/** Revise a draft deck against its comments + chat feedback into editable slides. */
export async function reviseSlides(deck: Deck): Promise<Slide[]> {
  const current = { title: deck.title, slides: deck.slides.map(toContent) };

  const { object } = await generateObject({
    model: getContentModel(),
    schema: deckSchema,
    system: SYSTEM,
    prompt: `Current draft deck (JSON):\n${JSON.stringify(current, null, 2)}\n\nReviewer feedback:\n${feedbackBlock(deck)}\n\nReturn the full revised deck.`,
  });

  // Map back to builder slides: fresh, editable, no leftover comments/overrides.
  return object.slides.map((s) => ({
    ...s,
    overrides: {},
    comments: [],
  })) as Slide[];
}
