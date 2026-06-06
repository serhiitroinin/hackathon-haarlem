/**
 * Maverx design tokens — lifted verbatim from "Maverx - Presentation Style Guide
 * for Hackaton.pptx" (slide 5, the colour system). Slides are pixel-specific, so
 * the renderer uses these constants as inline styles rather than Tailwind theme
 * tokens.
 */
export const MVX = {
  primary: "#0D006A", // Primary Dark — titles & body text
  deepPurple: "#3F0576", // Section headers, borders
  coverBg: "#1A0040", // Cover & section slide backgrounds
  roseRed: "#EF4453", // Secondary accent
  orange: "#F48A28", // CTA, inline highlights
  teal: "#00B0F0", // CTA, inline highlights
  lavender: "#BCB3FF", // Card backgrounds
  roseTint: "#F7B8C0",
  orangeTint: "#FAD0A8",
  grey: "#262626", // Captions, footnotes
  bgLavender: "#EDE9FF", // Alt content background
  bgRose: "#FEF0F1",
  bgOrange: "#FDEBDB",
  offWhite: "#F2F2F2", // Background, text on dark backgrounds
  white: "#FFFFFF",
} as const;

/** The four "base accents" a slide may use to emphasize words / decorate. */
export const ACCENTS = {
  purple: MVX.deepPurple,
  rose: MVX.roseRed,
  orange: MVX.orange,
  teal: MVX.teal,
} as const;

export type AccentKey = keyof typeof ACCENTS;

export const FONT_HEADING = "var(--font-space-grotesk), 'Space Grotesk', sans-serif";
export const FONT_BODY = "var(--font-raleway), 'Raleway', sans-serif";

/* ---- Inspector constraints — the ONLY values a user may pick ------------- */

/** Brand colours selectable for text/elements (palette + accents), with labels. */
export const COLOR_OPTIONS: { key: string; label: string; hex: string }[] = [
  { key: "primary", label: "Primary Dark", hex: MVX.primary },
  { key: "deepPurple", label: "Deep Purple", hex: MVX.deepPurple },
  { key: "roseRed", label: "Rose Red", hex: MVX.roseRed },
  { key: "orange", label: "Orange", hex: MVX.orange },
  { key: "teal", label: "Teal", hex: MVX.teal },
  { key: "grey", label: "Dark Grey", hex: MVX.grey },
  { key: "white", label: "White", hex: MVX.white },
];

/** Background colours selectable for light slides (style guide backgrounds). */
export const BG_OPTIONS: { key: string; label: string; hex: string }[] = [
  { key: "white", label: "White", hex: MVX.white },
  { key: "offWhite", label: "Off-White", hex: MVX.offWhite },
  { key: "bgLavender", label: "BG Lavender", hex: MVX.bgLavender },
  { key: "bgRose", label: "Rose Tint", hex: MVX.bgRose },
  { key: "bgOrange", label: "Orange Tint", hex: MVX.bgOrange },
];

export function colorHex(key?: string): string | undefined {
  return COLOR_OPTIONS.find((c) => c.key === key)?.hex;
}
export function bgHex(key?: string): string | undefined {
  return BG_OPTIONS.find((c) => c.key === key)?.hex;
}

/** Slides are designed at 96 dpi: 1pt = 4/3 px. The type scale (in pt) the guide
 * documents — these are the only sizes the inspector offers. */
export const PT_TO_PX = 4 / 3;
export const SIZE_SCALE_PT = [15, 18, 20, 22, 24, 26, 28, 33, 40, 44, 54, 72];

export const WEIGHT_OPTIONS: { value: 400 | 500 | 600 | 700; label: string }[] = [
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semibold" },
  { value: 700, label: "Bold" },
];
