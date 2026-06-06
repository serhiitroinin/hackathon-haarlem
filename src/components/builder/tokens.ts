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
