import { type AccentKey } from "./tokens";

/**
 * A minimal slide model that maps onto the Maverx template families. The future
 * training framework will emit this shape; for now a sample deck seeds it.
 */
export type SlideKind =
  | "cover" // title slide (dark)
  | "section" // section divider (dark)
  | "agenda" // numbered agenda / contents
  | "content" // theory / general content (light)
  | "example" // concrete example (light)
  | "exercise" // active exercise (light)
  | "wrapup" // takeaways / next steps (light)
  | "timetable"; // module timetable grid

/** Speaker notes — the 6 fields the style guide requires on every slide. */
export type SpeakerNotes = {
  aim: string;
  time: string;
  instructions: string;
  keyPoints: string;
  linkToReality: string;
  debrief: string;
};

export type AgendaItem = { label: string; desc?: string };
export type TimetableRow = { time: string; module: string; activities: string };

/** Per-element brand-constrained style override. All optional; keys reference
 * COLOR_OPTIONS / SIZE_SCALE_PT / WEIGHT_OPTIONS in tokens.ts. */
export type ElementStyle = {
  colorKey?: string;
  sizePt?: number;
  weight?: 400 | 500 | 600 | 700;
};

/** Stable ids for selectable elements on a slide. */
export const ELEMENT_IDS = {
  eyebrow: "eyebrow",
  title: "title",
  subtitle: "subtitle",
  bullet: (i: number) => `bullet:${i}`,
} as const;

export type Slide = {
  id: string;
  kind: SlideKind;
  /** Small label above the title, e.g. "Topic 1 · Theory". */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Base accent used for emphasis + decoration on this slide. */
  accent: AccentKey;
  /** Body bullets for content/example/exercise/wrapup. `**word**` => accent colour. */
  bullets?: string[];
  /** For agenda slides. */
  agenda?: AgendaItem[];
  /** For timetable slides. */
  rows?: TimetableRow[];
  notes?: SpeakerNotes;
  /** Per-element style overrides, keyed by element id (see ELEMENT_IDS). */
  overrides?: Record<string, ElementStyle>;
  /** Optional background colour key (light slides) — see BG_OPTIONS. */
  background?: string;
};

export type Deck = { title: string; slides: Slide[] };

export const EMPTY_NOTES: SpeakerNotes = {
  aim: "",
  time: "",
  instructions: "",
  keyPoints: "",
  linkToReality: "",
  debrief: "",
};
