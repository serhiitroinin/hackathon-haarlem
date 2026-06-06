/**
 * Fake Google Drive — derives virtual files from the plain-text corpus in
 * `fake-docs.ts`. No real Google integration or network call. To add docs, edit
 * fake-docs.ts (not this file).
 */
import { FAKE_DOCS, type DriveKind, type RawDoc } from "./fake-docs";

export { type DriveKind } from "./fake-docs";

export type FakeDriveFile = {
  id: string;
  name: string;
  kind: DriveKind;
  mimeType: string;
  owner: string;
  modified: string;
  sizeBytes: number;
  starred?: boolean;
  shared?: boolean;
  text: string;
};

/** Picker-facing metadata (no `text`). */
export type DriveFileMeta = Omit<FakeDriveFile, "text">;

/** What a picked file resolves to for a consumer — the content to use in place. */
export type DriveFileContent = {
  id: string;
  name: string;
  kind: DriveKind;
  mimeType: string;
  text: string;
};

const MIME: Record<DriveKind, string> = {
  doc: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
  slides: "application/vnd.google-apps.presentation",
  pdf: "application/pdf",
  image: "image/png",
};

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "doc"
  );
}

// Deterministic recent dates so the build is reproducible (no Date.now()).
const BASE = Date.parse("2026-06-05T12:00:00Z");
const DAY = 86_400_000;

function build(raw: RawDoc, i: number): FakeDriveFile {
  // Google Docs/Sheets/Slides report ~0 bytes; binary types use text length.
  const native = raw.kind === "doc" || raw.kind === "sheet" || raw.kind === "slides";
  return {
    id: `drv-${slug(raw.name)}`,
    name: raw.name,
    kind: raw.kind,
    mimeType: MIME[raw.kind],
    owner: raw.owner ?? "you",
    modified: raw.modified ?? new Date(BASE - i * DAY).toISOString(),
    sizeBytes: native ? 0 : Math.max(1024, raw.text.length * 12),
    starred: raw.starred,
    shared: raw.shared,
    text: raw.text,
  };
}

export const FAKE_DRIVE: FakeDriveFile[] = FAKE_DOCS.map(build);

export function driveMeta(): DriveFileMeta[] {
  return FAKE_DRIVE.map(({ text: _text, ...meta }) => meta);
}

export function getDriveFiles(ids: string[]): FakeDriveFile[] {
  const set = new Set(ids);
  return FAKE_DRIVE.filter((f) => set.has(f.id));
}

/** Resolve picked ids to their content (text included) for use anywhere. */
export function getDriveContent(ids: string[]): DriveFileContent[] {
  return getDriveFiles(ids).map((f) => ({
    id: f.id,
    name: f.name,
    kind: f.kind,
    mimeType: f.mimeType,
    text: f.text,
  }));
}
