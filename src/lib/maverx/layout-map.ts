import path from "node:path";

import type { Block } from "./schema";

/**
 * Where the Maverx-provided assets live. Drop the downloaded files here:
 *   assets/maverx/master.pptx       <- "Master slides (.pptx)" from the brief
 *   assets/maverx/style-guide.pdf   <- reference only
 *   assets/maverx/example.docx      <- reference only
 */
export const ASSETS_DIR = path.join(process.cwd(), "assets", "maverx");
export const MASTER_FILE = "master.pptx";
export const MASTER_LABEL = "master";

/**
 * One layout = which slide of master.pptx to CLONE for a given kind of slide,
 * plus the shape names whose text we overwrite. We clone real master slides so
 * the house style (fonts/colors/logo/layout) comes along untouched — that is the
 * "reference, don't recreate" requirement.
 *
 * Shape names are the `p:cNvPr` "name" attributes from the master's slide XML.
 * Run `pnpm inspect:master` once the real master.pptx is in place to print the
 * actual slide numbers + shape names, then fill these in. The defaults use the
 * names PowerPoint assigns by convention so it has a chance of working untouched.
 */
export type LayoutEntry = {
  /** 1-based slide number in master.pptx to clone. */
  source: number;
  /** Shape name to receive the slide title. */
  titleShape: string;
  /** Shape name to receive the body bullets. */
  bodyShape?: string;
  /** Shape name of a table to fill, if this layout has one. */
  tableShape?: string;
};

export type LayoutMap = {
  /** Opening title slide of the deck. */
  title: LayoutEntry;
  /** Kick-off agenda / learning-goals slide. */
  agenda: LayoutEntry;
  /** One layout per didactic block. */
  byBlock: Record<Block, LayoutEntry>;
};

const TITLE = "Title 1";
const BODY = "Content Placeholder 2";

/**
 * DEFAULT MAP — adjust to the real master after running `pnpm inspect:master`.
 * Until then every layout clones slide 1; once you know which master slide is the
 * section/exercise/etc. layout, point each block at it for full house-style range.
 */
export const layoutMap: LayoutMap = {
  title: { source: 1, titleShape: TITLE, bodyShape: "Subtitle 2" },
  agenda: { source: 1, titleShape: TITLE, bodyShape: BODY },
  byBlock: {
    kickoff: { source: 1, titleShape: TITLE, bodyShape: BODY },
    theory: { source: 1, titleShape: TITLE, bodyShape: BODY },
    example: { source: 1, titleShape: TITLE, bodyShape: BODY },
    exercise: { source: 1, titleShape: TITLE, bodyShape: BODY },
    wrapup: { source: 1, titleShape: TITLE, bodyShape: BODY },
  },
};

/** Human labels for the block, used on slides/notes where helpful. */
export const BLOCK_LABEL: Record<Block, string> = {
  kickoff: "Kick-off",
  theory: "Theory",
  example: "Example",
  exercise: "Exercise",
  wrapup: "Wrap-up",
};
