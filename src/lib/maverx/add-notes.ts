import "server-only";

/* eslint-disable @typescript-eslint/prefer-for-of --
   We iterate live xmldom NodeLists by index; some loops remove nodes while
   walking, so index control is intentional, not convertible to for-of. */
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import type JSZip from "jszip";

import type { SpeakerNotes } from "./schema";

/**
 * Speaker notes are a hard Maverx requirement (every slide, all 5 fields) and part
 * of the biggest scoring bucket. pptx-automizer copies a source slide's notes when
 * cloning but exposes no API to set notes text, so we post-process the output zip:
 *   - if a slide already has a notes slide  -> replace its body text
 *   - if it doesn't                         -> construct one (reusing the template's
 *                                              existing notes master)
 * We never fabricate a notes master from scratch — if the template has none we throw
 * a clear, actionable error instead of risking a file that won't open in PowerPoint.
 */

const A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const REL = "http://schemas.openxmlformats.org/package/2006/relationships";
const RT_NOTES_SLIDE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide";
const RT_SLIDE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide";
const RT_NOTES_MASTER =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster";
const CT_NOTES_SLIDE =
  "application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml";

const parser = new DOMParser();
const serializer = new XMLSerializer();

// Use xmldom's own node types (not the global DOM lib) so serialize/import line up.
type XmlDoc = ReturnType<InstanceType<typeof DOMParser>["parseFromString"]>;
type XmlEl = ReturnType<XmlDoc["createElement"]>;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Flatten the 5 required note fields into one ordered list of paragraph lines. */
export function notesToParagraphs(n: SpeakerNotes): string[] {
  return [
    `Aim: ${n.aim}`,
    `Time: ${n.time}`,
    "Instructions:",
    ...n.instructions.map((step, i) => `${i + 1}. ${step}`),
    `Reflective question: ${n.reflectiveQuestion}`,
    `Debrief: ${n.debrief}`,
  ];
}

function paragraphsXml(lines: string[]): string {
  return lines
    .map(
      (line) =>
        `<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${esc(line)}</a:t></a:r></a:p>`,
    )
    .join("");
}

async function readText(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  return file ? file.async("string") : null;
}

function parse(xml: string): XmlDoc {
  return parser.parseFromString(xml, "text/xml");
}

/** Ordered slide part paths, following presentation.xml's sldIdLst. */
async function orderedSlidePaths(zip: JSZip): Promise<string[]> {
  const presXml = await readText(zip, "ppt/presentation.xml");
  const relsXml = await readText(zip, "ppt/_rels/presentation.xml.rels");
  if (!presXml || !relsXml) return [];

  const relTarget = new Map<string, string>();
  const rels = parse(relsXml).getElementsByTagName("Relationship");
  for (let i = 0; i < rels.length; i++) {
    const r = rels[i]!;
    relTarget.set(r.getAttribute("Id") ?? "", r.getAttribute("Target") ?? "");
  }

  const out: string[] = [];
  const sldIds = parse(presXml).getElementsByTagName("p:sldId");
  for (let i = 0; i < sldIds.length; i++) {
    const rid = sldIds[i]!.getAttribute("r:id");
    const target = rid ? relTarget.get(rid) : undefined;
    if (target) out.push(`ppt/${target.replace(/^\.\.\//, "").replace(/^\//, "")}`);
  }
  return out;
}

function relsPathFor(partPath: string): string {
  const slash = partPath.lastIndexOf("/");
  return `${partPath.slice(0, slash)}/_rels/${partPath.slice(slash + 1)}.rels`;
}

function basename(p: string): string {
  return p.slice(p.lastIndexOf("/") + 1);
}

/** Replace the text of the body placeholder in a notes slide. */
function setNotesBody(notesDoc: XmlDoc, lines: string[]): boolean {
  const sps = notesDoc.getElementsByTagName("p:sp");
  for (let i = 0; i < sps.length; i++) {
    const sp = sps[i]!;
    const ph = sp.getElementsByTagName("p:ph")[0];
    const type = ph?.getAttribute("type");
    // The notes text placeholder is the body ph (skip the slide-image ph).
    if (type && type !== "body") continue;
    const txBody = sp.getElementsByTagName("p:txBody")[0];
    if (!txBody) continue;
    // Remove existing paragraphs, keep <a:bodyPr> / <a:lstStyle>.
    const ps = txBody.getElementsByTagName("a:p");
    for (let j = ps.length - 1; j >= 0; j--) ps[j]!.parentNode?.removeChild(ps[j]!);
    const frag = parse(`<root xmlns:a="${A}">${paragraphsXml(lines)}</root>`);
    const newPs = frag.getElementsByTagName("a:p");
    // Import + append (live NodeList shrinks as we move nodes, so walk from end).
    const collected: XmlEl[] = [];
    for (let j = 0; j < newPs.length; j++) collected.push(newPs[j]!);
    for (const p of collected) txBody.appendChild(notesDoc.importNode(p, true));
    return true;
  }
  return false;
}

function findNotesMaster(zip: JSZip): string | null {
  const f = zip.file(/ppt\/notesMasters\/notesMaster\d+\.xml$/);
  return f.length ? f[0]!.name : null;
}

function nextNotesSlideIndex(zip: JSZip): number {
  const existing = zip.file(/ppt\/notesSlides\/notesSlide(\d+)\.xml$/);
  let max = 0;
  for (const f of existing) {
    const m = /notesSlide(\d+)\.xml$/.exec(f.name);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function nextRelId(relsDoc: XmlDoc): string {
  const rels = relsDoc.getElementsByTagName("Relationship");
  let max = 0;
  for (let i = 0; i < rels.length; i++) {
    const m = /^rId(\d+)$/.exec(rels[i]!.getAttribute("Id") ?? "");
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `rId${max + 1}`;
}

async function constructNotesSlide(
  zip: JSZip,
  slidePath: string,
  slideRelsXml: string | null,
  lines: string[],
): Promise<void> {
  const notesMaster = findNotesMaster(zip);
  if (!notesMaster) {
    throw new Error(
      "master.pptx has no notes master, so speaker-note slides can't be created " +
        "safely. Fix in 30s: open assets/maverx/master.pptx in PowerPoint, add one " +
        "line of Speaker Notes to any slide, save, and re-run. That creates the notes " +
        "master the generator needs.",
    );
  }

  const idx = nextNotesSlideIndex(zip);
  const notesSlidePath = `ppt/notesSlides/notesSlide${idx}.xml`;
  const slideRel = `../slides/${basename(slidePath)}`;
  const masterRel = `../notesMasters/${basename(notesMaster)}`;

  // 1. notes slide part
  const notesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="${A}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${paragraphsXml(lines)}</p:txBody></p:sp></p:spTree></p:cSld></p:notes>`;
  zip.file(notesSlidePath, notesXml);

  // 2. notes slide rels -> back to the slide + the notes master
  zip.file(
    `ppt/notesSlides/_rels/notesSlide${idx}.xml.rels`,
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${REL}"><Relationship Id="rId1" Type="${RT_SLIDE}" Target="${slideRel}"/><Relationship Id="rId2" Type="${RT_NOTES_MASTER}" Target="${masterRel}"/></Relationships>`,
  );

  // 3. slide rels -> the new notes slide
  const relsDoc = parse(
    slideRelsXml ??
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${REL}"></Relationships>`,
  );
  const rel = relsDoc.createElement("Relationship");
  rel.setAttribute("Id", nextRelId(relsDoc));
  rel.setAttribute("Type", RT_NOTES_SLIDE);
  rel.setAttribute("Target", `../notesSlides/notesSlide${idx}.xml`);
  relsDoc.documentElement?.appendChild(rel);
  zip.file(relsPathFor(slidePath), serializer.serializeToString(relsDoc));

  // 4. content-types override
  await addContentTypeOverride(zip, `/${notesSlidePath}`);
}

async function addContentTypeOverride(zip: JSZip, partName: string): Promise<void> {
  const ctPath = "[Content_Types].xml";
  const xml = await readText(zip, ctPath);
  if (!xml) return;
  if (xml.includes(`PartName="${partName}"`)) return;
  const doc = parse(xml);
  const o = doc.createElement("Override");
  o.setAttribute("PartName", partName);
  o.setAttribute("ContentType", CT_NOTES_SLIDE);
  doc.documentElement?.appendChild(o);
  zip.file(ctPath, serializer.serializeToString(doc));
}

function removeContentTypeOverride(zip: JSZip, partName: string, xml: string): string {
  const doc = parse(xml);
  const overrides = doc.getElementsByTagName("Override");
  for (let i = overrides.length - 1; i >= 0; i--) {
    if (overrides[i]!.getAttribute("PartName") === partName) {
      overrides[i]!.parentNode?.removeChild(overrides[i]!);
    }
  }
  return serializer.serializeToString(doc);
}

/**
 * Remove notes slides not referenced by any current slide. Truncating the master's
 * own layout slides can leave dangling notes slides whose relationships point at
 * deleted slides — a broken reference that makes PowerPoint offer to "repair".
 */
async function pruneOrphanNotes(zip: JSZip, slidePaths: string[]): Promise<void> {
  const referenced = new Set<string>();
  for (const sp of slidePaths) {
    const relsXml = await readText(zip, relsPathFor(sp));
    if (!relsXml) continue;
    const rels = parse(relsXml).getElementsByTagName("Relationship");
    for (let i = 0; i < rels.length; i++) {
      if (rels[i]!.getAttribute("Type") === RT_NOTES_SLIDE) {
        const t = rels[i]!.getAttribute("Target") ?? "";
        referenced.add(`ppt/notesSlides/${basename(t)}`);
      }
    }
  }

  const all = zip.file(/ppt\/notesSlides\/notesSlide\d+\.xml$/);
  let ct = await readText(zip, "[Content_Types].xml");
  for (const f of all) {
    if (referenced.has(f.name)) continue;
    zip.remove(f.name);
    zip.remove(relsPathFor(f.name));
    if (ct) ct = removeContentTypeOverride(zip, `/${f.name}`, ct);
  }
  if (ct) zip.file("[Content_Types].xml", ct);
}

/**
 * Write the 5-field speaker notes onto every slide of the built deck, in order.
 * `perSlide[i]` are the formatted note lines for the i-th slide.
 */
export async function injectNotes(
  zip: JSZip,
  perSlide: string[][],
): Promise<void> {
  const slidePaths = await orderedSlidePaths(zip);
  await pruneOrphanNotes(zip, slidePaths);

  for (let i = 0; i < slidePaths.length && i < perSlide.length; i++) {
    const slidePath = slidePaths[i]!;
    const lines = perSlide[i]!;
    const slideRelsPath = relsPathFor(slidePath);
    const slideRelsXml = await readText(zip, slideRelsPath);

    // Does this slide already point at a notes slide?
    let notesTarget: string | null = null;
    if (slideRelsXml) {
      const rels = parse(slideRelsXml).getElementsByTagName("Relationship");
      for (let j = 0; j < rels.length; j++) {
        if (rels[j]!.getAttribute("Type") === RT_NOTES_SLIDE) {
          notesTarget = rels[j]!.getAttribute("Target");
          break;
        }
      }
    }

    if (notesTarget) {
      const notesPath = `ppt/slides/${notesTarget}`
        .replace("ppt/slides/../", "ppt/")
        .replace(/^\/+/, "");
      const notesXml = await readText(zip, notesPath);
      if (notesXml) {
        const doc = parse(notesXml);
        if (setNotesBody(doc, lines)) {
          zip.file(notesPath, serializer.serializeToString(doc));
          continue;
        }
      }
    }

    // No usable notes slide — build one.
    await constructNotesSlide(zip, slidePath, slideRelsXml, lines);
  }
}
