/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  FAKE GOOGLE DRIVE — DOCUMENT STORE                                        │
 * │  This is the ONE file to edit. Paste a document's plain text into `text`   │
 * │  and add an entry below; it shows up as a virtual file in the picker and   │
 * │  imports with that text as its content. Everything else (id, size, date)   │
 * │  is derived automatically — name + kind + text is all you need.            │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * kind: "doc" (Google Docs) | "sheet" | "slides" | "pdf" | "image"
 * Optional flags: starred, shared, owner (defaults to "you"), modified (ISO).
 */

export type DriveKind = "doc" | "sheet" | "slides" | "pdf" | "image";

export type RawDoc = {
  name: string;
  kind: DriveKind;
  owner?: string;
  starred?: boolean;
  shared?: boolean;
  /** ISO date; if omitted a recent date is derived from position. */
  modified?: string;
  /** The document's full plain text — paste it here. */
  text: string;
};

export const FAKE_DOCS: RawDoc[] = [
  {
    name: "Applied AI — Training Brief.gdoc",
    kind: "doc",
    starred: true,
    text: `Applied AI for Professionals — Training Brief

Audience: professionals, no coding background.
Objective: leave with one concrete, responsible AI use case for their own work.
Three roles of AI to teach: automation, decision support, augmentation.
Constraints: 95 minutes, hands-on majority, practical not theoretical.
Key risks to cover: data residency, bias, over-trust in outputs.`,
  },
  {
    name: "Maverx Brand & Style Guide.pdf",
    kind: "pdf",
    owner: "Maverx Design",
    shared: true,
    text: `Maverx Presentation Style Guide (summary)

Colours: Primary Dark #0D006A, Deep Purple #3F0576, Rose Red #EF4453,
Orange #F48A28, Teal #00B0F0.
Type: Space Grotesk for headings (Bold 33pt titles), Raleway for body.
Rules: max three base colours per slide; lighter background -> darker
highlights; respect safe-area margins; complete speaker notes on every slide.`,
  },
  {
    name: "Cohort 12 — Participants.gsheet",
    kind: "sheet",
    text: `Name, Role, Department
A. de Vries, Caseworker, Youth Care
M. Jansen, Team Lead, Intake
S. Bakker, Policy Advisor, Strategy

Focus areas: document processing, reporting, decision support.`,
  },
  {
    name: "Kickoff Session — Notes.gslides",
    kind: "slides",
    owner: "R. Smit",
    shared: true,
    text: `Kickoff deck notes:
Welcome + why now (AI accessibility, not capability, changed everything).
How AI works: input -> pattern -> predicted output; it does not reason.
Ethics warm-up: 2-3 real cases, "is this ethical?", reveal + debrief.`,
  },
  {
    name: "Oplossingsgericht werken — methodebeschrijving.pdf",
    kind: "pdf",
    owner: "Movisie",
    shared: true,
    text: `Methodebeschrijving oplossingsgericht werken in sociaal werk (samenvatting).
Uitgangspunt: focus op oplossingen en krachten van de client, niet op problemen.
Kerntechnieken: wondervraag, schaalvragen, uitzonderingen zoeken.`,
  },
  {
    name: "Pilot Feedback — Q2.gdoc",
    kind: "doc",
    text: `Pilot feedback themes:
+ Hands-on exercises landed best (invoice extraction, dataset anomaly).
- Need more time on data privacy.
- Participants want a take-home checklist for their own use case.`,
  },
];
