import "server-only";

import PptxGenJS from "pptxgenjs";

import { ACCENTS, colorHex, MVX } from "~/components/builder/tokens";
import { type Deck, type Slide } from "~/components/builder/types";

/**
 * Render a builder Deck to a real .pptx (16:9, 13.333"×7.5") using the Maverx
 * design tokens — mirrors the on-screen SlideCanvas closely enough to hand off.
 * Fonts (Space Grotesk / Raleway) are referenced by name; the style guide tells
 * trainers to install Space Grotesk, so this matches their workflow.
 */

const HEAD = "Space Grotesk";
const BODY = "Raleway";
const MARGIN = 0.75; // inches (72px @ 96dpi)
const SLIDE_W = 13.333;
const CONTENT_W = SLIDE_W - MARGIN * 2;

const hex = (c?: string) => (c ?? "#000000").replace("#", "");

type Base = { sizePt: number; color: string; bold: boolean };

function resolve(slide: Slide, id: string, base: Base): Base {
  const ov = slide.overrides?.[id];
  if (!ov) return base;
  return {
    sizePt: ov.sizePt ?? base.sizePt,
    color: ov.colorKey ? (colorHex(ov.colorKey) ?? base.color) : base.color,
    bold: ov.weight ? ov.weight >= 600 : base.bold,
  };
}

/** Split `**word**` into pptx text runs, emphasised runs in `accent`. */
function runs(text: string, accent: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p) =>
    p.startsWith("**") && p.endsWith("**")
      ? { text: p.slice(2, -2), options: { color: hex(accent), bold: true } }
      : { text: p, options: {} },
  );
}

function addLightHeader(slide: Slide, s: PptxGenJS.Slide, accent: string) {
  s.addText("maverx", {
    x: SLIDE_W - MARGIN - 1.5,
    y: 0.45,
    w: 1.5,
    h: 0.35,
    align: "right",
    fontFace: HEAD,
    bold: true,
    fontSize: 14,
    color: hex(MVX.primary),
  });
  let y = MARGIN;
  if (slide.eyebrow) {
    const e = resolve(slide, "eyebrow", { sizePt: 13, color: accent, bold: true });
    s.addText(slide.eyebrow.toUpperCase(), {
      x: MARGIN,
      y,
      w: CONTENT_W,
      h: 0.3,
      fontFace: HEAD,
      bold: e.bold,
      fontSize: e.sizePt,
      color: hex(e.color),
      charSpacing: 2,
    });
    y += 0.4;
  }
  const t = resolve(slide, "title", { sizePt: 33, color: MVX.primary, bold: true });
  s.addText(slide.title, {
    x: MARGIN,
    y,
    w: CONTENT_W,
    h: 0.9,
    fontFace: HEAD,
    bold: t.bold,
    fontSize: t.sizePt,
    color: hex(t.color),
  });
  y += 1.0;
  s.addShape("rect", { x: MARGIN, y, w: 0.6, h: 0.07, fill: { color: hex(accent) } });
  return y + 0.35;
}

function buildSlide(pptx: PptxGenJS, slide: Slide) {
  const accent = ACCENTS[slide.accent];
  const s = pptx.addSlide();

  if (slide.kind === "cover" || slide.kind === "section") {
    s.background = { color: hex(MVX.coverBg) };
    s.addText("maverx", {
      x: MARGIN,
      y: 0.5,
      w: 3,
      h: 0.4,
      fontFace: HEAD,
      bold: true,
      fontSize: 15,
      color: "FFFFFF",
    });
    const center = slide.kind === "section";
    s.addShape("rect", {
      x: MARGIN,
      y: center ? 2.4 : 4.4,
      w: 0.7,
      h: 0.09,
      fill: { color: hex(accent) },
    });
    if (slide.eyebrow) {
      s.addText(slide.eyebrow.toUpperCase(), {
        x: MARGIN,
        y: center ? 2.0 : 4.0,
        w: CONTENT_W,
        h: 0.3,
        fontFace: HEAD,
        bold: true,
        fontSize: 14,
        color: hex(accent),
        charSpacing: 2,
      });
    }
    const t = resolve(slide, "title", { sizePt: slide.kind === "section" ? 40 : 38, color: MVX.white, bold: true });
    s.addText(slide.title, {
      x: MARGIN,
      y: center ? 2.7 : 4.7,
      w: CONTENT_W,
      h: 1.4,
      fontFace: HEAD,
      bold: t.bold,
      fontSize: t.sizePt,
      color: "FFFFFF",
    });
    if (slide.subtitle) {
      s.addText(slide.subtitle, {
        x: MARGIN,
        y: center ? 3.9 : 5.9,
        w: CONTENT_W,
        h: 0.6,
        fontFace: BODY,
        fontSize: 18,
        color: "D8D2E8",
      });
    }
    if (slide.kind === "cover") {
      s.addText("maverx.nl", {
        x: MARGIN,
        y: 6.9,
        w: 3,
        h: 0.3,
        fontFace: BODY,
        fontSize: 12,
        color: "9990B0",
      });
    }
    addNotes(s, slide);
    return;
  }

  // Light content slides
  const bg =
    slide.kind === "example"
      ? MVX.bgLavender
      : slide.kind === "exercise"
        ? MVX.bgOrange
        : slide.kind === "wrapup"
          ? MVX.bgRose
          : MVX.white;
  s.background = { color: hex(bg) };
  const y0 = addLightHeader(slide, s, accent);

  if (slide.kind === "timetable" && slide.rows) {
    const header = ["Time", "Module", "Activities"].map((t) => ({
      text: t,
      options: { fill: { color: hex(accent) }, color: "FFFFFF", bold: true, fontFace: HEAD, fontSize: 11 },
    }));
    const body = slide.rows.map((r, i) => {
      const fill = { color: hex(i % 2 ? MVX.bgLavender : MVX.offWhite) };
      return [
        { text: r.time, options: { fill, color: hex(accent), bold: true, fontFace: HEAD, fontSize: 12 } },
        { text: r.module, options: { fill, color: hex(MVX.primary), bold: true, fontFace: HEAD, fontSize: 12 } },
        { text: r.activities, options: { fill, color: hex(MVX.grey), fontFace: BODY, fontSize: 11 } },
      ];
    });
    s.addTable([header, ...body], {
      x: MARGIN,
      y: y0,
      w: CONTENT_W,
      colW: [1.6, 2.4, CONTENT_W - 4.0],
      border: { type: "solid", color: "FFFFFF", pt: 2 },
      valign: "middle",
    });
  } else if (slide.kind === "agenda" && slide.agenda) {
    slide.agenda.forEach((item, i) => {
      const y = y0 + i * 0.55;
      s.addText(`${i + 1}`, {
        x: MARGIN,
        y,
        w: 0.5,
        h: 0.45,
        fontFace: HEAD,
        bold: true,
        fontSize: 20,
        color: hex(accent),
      });
      s.addText(
        [
          { text: item.label, options: { bold: true, color: hex(MVX.primary), fontFace: HEAD } },
          ...(item.desc ? [{ text: `   —   ${item.desc}`, options: { color: hex(MVX.grey), fontFace: BODY } }] : []),
        ],
        { x: MARGIN + 0.6, y, w: CONTENT_W - 0.6, h: 0.45, fontSize: 16, valign: "middle" },
      );
    });
  } else {
    const bullets = slide.bullets ?? [];
    // One paragraph per bullet (no • marker — style guide uses spacing instead);
    // the last run of each bullet breaks the line, with space before the next.
    const para = bullets.flatMap((b, i) => {
      const st = resolve(slide, `bullet:${i}`, { sizePt: 17, color: MVX.primary, bold: false });
      const parsed = runs(b, accent);
      return parsed.map((r, j) => ({
        text: r.text,
        options: {
          ...r.options,
          fontFace: BODY,
          fontSize: st.sizePt,
          color: (r.options as { color?: string }).color ?? hex(st.color),
          breakLine: j === parsed.length - 1,
          paraSpaceBefore: i > 0 && j === 0 ? 12 : 0,
        },
      }));
    });
    if (para.length) {
      s.addText(para, {
        x: MARGIN,
        y: y0,
        w: CONTENT_W,
        h: 7.5 - y0 - MARGIN,
        valign: "top",
        lineSpacingMultiple: 1.25,
      });
    }
  }
  addNotes(s, slide);
}

function addNotes(s: PptxGenJS.Slide, slide: Slide) {
  const n = slide.notes;
  if (!n) return;
  const parts = [
    n.aim && `Aim: ${n.aim}`,
    n.time && `Time: ${n.time}`,
    n.instructions && `Instructions: ${n.instructions}`,
    n.keyPoints && `Key points: ${n.keyPoints}`,
    n.linkToReality && `Link to reality: ${n.linkToReality}`,
    n.debrief && `Debrief: ${n.debrief}`,
  ].filter(Boolean);
  if (parts.length) s.addNotes(parts.join("\n\n"));
}

export async function buildDeckPptx(deck: Deck): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "MVX16x9", width: SLIDE_W, height: 7.5 });
  pptx.layout = "MVX16x9";
  pptx.author = "Maverx Slide Builder";
  pptx.title = deck.title;
  for (const slide of deck.slides) buildSlide(pptx, slide);
  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}
