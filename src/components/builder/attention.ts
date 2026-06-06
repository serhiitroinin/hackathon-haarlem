import { type Slide, type SpeakerNotes } from "./types";

/**
 * Style-guide compliance checks. Each returns issues that flag a slide as
 * "needs attention" in the builder, mapping to concrete rules from the Maverx
 * style guide (slides 3–9, 15).
 */
export type Issue = {
  severity: "warn" | "info";
  message: string;
};

const TITLE_MAX = 60; // ~ what fits at Space Grotesk Bold 33pt on one or two lines
const BODY_MAX_CHARS = 620; // dense-slide / safe-area overflow threshold
const MAX_BULLETS = 6;

function noteFieldsMissing(notes?: SpeakerNotes): string[] {
  if (!notes) return ["Aim", "Time", "Instructions", "Key points", "Link to reality", "Debrief"];
  const map: [keyof SpeakerNotes, string][] = [
    ["aim", "Aim"],
    ["time", "Time"],
    ["instructions", "Instructions"],
    ["keyPoints", "Key points"],
    ["linkToReality", "Link to reality"],
    ["debrief", "Debrief"],
  ];
  return map.filter(([k]) => !notes[k]?.trim()).map(([, label]) => label);
}

export function analyzeSlide(slide: Slide): Issue[] {
  const issues: Issue[] = [];

  if (!slide.title.trim()) {
    issues.push({ severity: "warn", message: "Missing title" });
  } else if (slide.title.length > TITLE_MAX) {
    issues.push({
      severity: "warn",
      message: `Title is long (${slide.title.length} chars) — may overflow at 33pt`,
    });
  }

  const bullets = slide.bullets ?? [];
  if (bullets.length > MAX_BULLETS) {
    issues.push({
      severity: "warn",
      message: `${bullets.length} bullets — consider splitting (style guide favours breathing room)`,
    });
  }

  const bodyChars = bullets.join(" ").length;
  if (bodyChars > BODY_MAX_CHARS) {
    issues.push({
      severity: "warn",
      message: "Dense slide — text may spill past the safe-area margins",
    });
  }

  // Rule: no "•" bullets on the first line of text.
  if (bullets.some((b) => /^\s*[•\-*]\s+/.test(b))) {
    issues.push({
      severity: "info",
      message: "Avoid “•/-” at the start of a line — use blank lines for spacing",
    });
  }

  // Rule: avoid "/" between words (use "and"/"or").
  const allText = [slide.title, slide.subtitle ?? "", ...bullets].join(" ");
  if (/\w\s*\/\s*\w/.test(allText)) {
    issues.push({
      severity: "info",
      message: "Avoid “/” in copy — write “and” or “or”",
    });
  }

  // Rule: every slide needs complete speaker notes.
  const missing = noteFieldsMissing(slide.notes);
  if (missing.length > 0) {
    issues.push({
      severity: missing.length >= 4 ? "warn" : "info",
      message: `Speaker notes incomplete: ${missing.join(", ")}`,
    });
  }

  return issues;
}

/** Highest severity present, or null if the slide is clean. */
export function slideStatus(slide: Slide): "warn" | "info" | null {
  const issues = analyzeSlide(slide);
  if (issues.some((i) => i.severity === "warn")) return "warn";
  if (issues.length > 0) return "info";
  return null;
}
