import "server-only";

import Automizer, {
  ModifyTableHelper,
  ModifyTextHelper,
  type ISlide,
  type TableData,
} from "pptx-automizer";

import { injectNotes, notesToParagraphs } from "./add-notes";
import {
  ASSETS_DIR,
  BLOCK_LABEL,
  MASTER_FILE,
  MASTER_LABEL,
  layoutMap,
  type LayoutEntry,
} from "./layout-map";
import type { SpeakerNotes, TrainingPlan } from "./schema";

/** A concrete slide to render: which master layout to clone + the text to inject. */
type RenderSlide = {
  entry: LayoutEntry;
  title: string;
  bullets: string[];
  table?: TableData;
  notes: SpeakerNotes;
};

function bulletParagraphs(bullets: string[]) {
  return ModifyTextHelper.setMultiText(
    bullets.map((b) => ({ paragraph: { bullet: true }, textRuns: [{ text: b }] })),
  );
}

function toTableData(table: { headers: string[]; rows: string[][] }): TableData {
  return {
    header: [{ values: table.headers }],
    body: table.rows.map((r) => ({ values: r })),
  };
}

/** Expand a plan into the ordered slide list, incl. title + agenda (all need notes). */
function renderSlides(plan: TrainingPlan): RenderSlide[] {
  const slides: RenderSlide[] = [];

  slides.push({
    entry: layoutMap.title,
    title: plan.title,
    bullets: plan.subtitle ? [plan.subtitle] : [plan.meta.topic],
    notes: {
      aim: "Open the session, welcome participants, set the tone.",
      time: "2 min",
      instructions: ["Introduce yourself", "State the title and why it matters today"],
      reflectiveQuestion: "What do you most want to get out of today?",
      debrief: "Energy set, expectations surfaced.",
    },
  });

  slides.push({
    entry: layoutMap.agenda,
    title: "Agenda & learning goals",
    bullets: [...plan.agenda, `Objective: ${plan.meta.objective}`],
    notes: {
      aim: "Give participants the map of the session and the goal.",
      time: "3 min",
      instructions: ["Walk through the agenda", "Confirm the primary objective"],
      reflectiveQuestion: "Which part is most relevant to your work?",
      debrief: "Shared roadmap and objective agreed.",
    },
  });

  for (const s of plan.slides) {
    slides.push({
      entry: layoutMap.byBlock[s.block],
      title: `${BLOCK_LABEL[s.block]} · ${s.title}`,
      bullets: s.bullets,
      table: s.table ? toTableData(s.table) : undefined,
      notes: s.notes,
    });
  }

  return slides;
}

/**
 * Build the full editable .pptx from the plan, cloning the Maverx master layouts so
 * the house style is preserved, then injecting 5-field speaker notes on every slide.
 * Returns the .pptx as a Buffer.
 */
export async function buildPptx(plan: TrainingPlan): Promise<Buffer> {
  const automizer = new Automizer({
    templateDir: ASSETS_DIR,
    removeExistingSlides: true, // start from zero slides
    autoImportSlideMasters: true, // keep each imported slide's master + layout
    cleanupPlaceholders: true, // drop untouched placeholders to avoid "click to add"
    cleanup: true, // remove orphaned slide/media files left after truncation
    verbosity: 1,
  });

  const pres = automizer.loadRoot(MASTER_FILE).load(MASTER_FILE, MASTER_LABEL);

  // Map each master slide -> the shape names it actually has, so a wrong name in
  // layout-map.ts is skipped (with a warning) instead of crashing the whole deck.
  const info = await pres.getInfo();
  const shapesBySource = new Map<number, Set<string>>();
  for (const si of info.slidesByTemplate(MASTER_LABEL)) {
    shapesBySource.set(si.number, new Set(si.elements.map((e) => e.name)));
  }
  const has = (source: number, name?: string) =>
    !!name && (shapesBySource.get(source)?.has(name) ?? false);

  const slides = renderSlides(plan);

  for (const s of slides) {
    pres.addSlide(MASTER_LABEL, s.entry.source, (slide: ISlide) => {
      if (has(s.entry.source, s.entry.titleShape)) {
        slide.modifyElement(s.entry.titleShape, [ModifyTextHelper.setText(s.title)]);
      } else {
        console.warn(
          `[maverx] title shape "${s.entry.titleShape}" not on master slide ${s.entry.source}`,
        );
      }
      if (s.bullets.length && has(s.entry.source, s.entry.bodyShape)) {
        slide.modifyElement(s.entry.bodyShape!, [bulletParagraphs(s.bullets)]);
      }
      if (s.table && has(s.entry.source, s.entry.tableShape)) {
        slide.modifyElement(s.entry.tableShape!, [
          ModifyTableHelper.setTableData(s.table),
        ]);
      }
    });
  }

  // pptx-automizer applies all modifications when we pull the final zip.
  const zip = await pres.getJSZip();
  await injectNotes(
    zip,
    slides.map((s) => notesToParagraphs(s.notes)),
  );

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
