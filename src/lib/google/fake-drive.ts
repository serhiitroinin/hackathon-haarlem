/**
 * Fake Google Drive — a mock corpus the picker lists and imports from. There is
 * NO real Google integration or network call; this is local sample data only.
 *
 * To add more fake docs later: append entries here. `text` is what gets stored
 * as the imported Source's extracted content (drop real fake-doc text in later).
 */

export type DriveKind = "doc" | "sheet" | "slides" | "pdf" | "image";

export type FakeDriveFile = {
  id: string;
  name: string;
  kind: DriveKind;
  mimeType: string;
  owner: string;
  /** ISO date. */
  modified: string;
  sizeBytes: number;
  starred?: boolean;
  shared?: boolean;
  /** Imported as the Source's text. Kept out of the picker `list` payload. */
  text: string;
};

/** Picker-facing metadata (no `text`). */
export type DriveFileMeta = Omit<FakeDriveFile, "text">;

const MIME: Record<DriveKind, string> = {
  doc: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
  slides: "application/vnd.google-apps.presentation",
  pdf: "application/pdf",
  image: "image/png",
};

function file(
  f: Omit<FakeDriveFile, "mimeType"> & { kind: DriveKind },
): FakeDriveFile {
  return { ...f, mimeType: MIME[f.kind] };
}

export const FAKE_DRIVE: FakeDriveFile[] = [
  file({
    id: "drv-brief",
    name: "Applied AI — Training Brief.gdoc",
    kind: "doc",
    owner: "you",
    modified: "2026-06-04T14:20:00Z",
    sizeBytes: 18_400,
    starred: true,
    text: `Applied AI for Professionals — Training Brief\n\nAudience: professionals, no coding background.\nObjective: leave with one concrete, responsible AI use case for their own work.\nThree roles of AI to teach: automation, decision support, augmentation.\nConstraints: 95 minutes, hands-on majority, practical not theoretical.\nKey risks to cover: data residency, bias, over-trust in outputs.`,
  }),
  file({
    id: "drv-brand",
    name: "Maverx Brand & Style Guide.pdf",
    kind: "pdf",
    owner: "Maverx Design",
    modified: "2026-05-28T09:05:00Z",
    sizeBytes: 2_640_000,
    shared: true,
    text: `Maverx Presentation Style Guide (summary)\n\nColours: Primary Dark #0D006A, Deep Purple #3F0576, Rose Red #EF4453, Orange #F48A28, Teal #00B0F0.\nType: Space Grotesk for headings (Bold 33pt titles), Raleway for body.\nRules: max three base colours per slide; lighter background -> darker highlights; respect safe-area margins; complete speaker notes on every slide.`,
  }),
  file({
    id: "drv-participants",
    name: "Cohort 12 — Participants.gsheet",
    kind: "sheet",
    owner: "you",
    modified: "2026-06-05T16:42:00Z",
    sizeBytes: 9_800,
    text: `Name, Role, Department\nA. de Vries, Caseworker, Youth Care\nM. Jansen, Team Lead, Intake\nS. Bakker, Policy Advisor, Strategy\nFocus areas: document processing, reporting, decision support.`,
  }),
  file({
    id: "drv-kickoff",
    name: "Kickoff Session — Notes.gslides",
    kind: "slides",
    owner: "R. Smit",
    modified: "2026-05-30T11:15:00Z",
    sizeBytes: 1_120_000,
    shared: true,
    text: `Kickoff deck notes:\nWelcome + why now (AI accessibility, not capability, changed everything).\nHow AI works: input -> pattern -> predicted output; it does not reason.\nEthics warm-up: 2-3 real cases, "is this ethical?", reveal + debrief.`,
  }),
  file({
    id: "drv-method",
    name: "Oplossingsgericht werken — methodebeschrijving.pdf",
    kind: "pdf",
    owner: "Movisie",
    modified: "2026-04-18T08:00:00Z",
    sizeBytes: 1_870_000,
    shared: true,
    text: `Methodebeschrijving oplossingsgericht werken in sociaal werk (samenvatting).\nUitgangspunt: focus op oplossingen en krachten van de client, niet op problemen.\nKerntechnieken: wondervraag, schaalvragen, uitzonderingen zoeken.`,
  }),
  file({
    id: "drv-feedback",
    name: "Pilot Feedback — Q2.gdoc",
    kind: "doc",
    owner: "you",
    modified: "2026-06-01T13:30:00Z",
    sizeBytes: 22_100,
    text: `Pilot feedback themes:\n+ Hands-on exercises landed best (invoice extraction, dataset anomaly).\n- Need more time on data privacy.\n- Participants want a take-home checklist for their own use case.`,
  }),
];

export function driveMeta(): DriveFileMeta[] {
  return FAKE_DRIVE.map(({ text: _text, ...meta }) => meta);
}
