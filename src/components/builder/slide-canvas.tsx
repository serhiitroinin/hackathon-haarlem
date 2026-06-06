import { type CSSProperties } from "react";

import { ACCENTS, FONT_BODY, FONT_HEADING, MVX } from "./tokens";
import { type Slide } from "./types";

const BASE_W = 1280;
const BASE_H = 720;
const MARGIN = 72; // safe-area margin (style guide slide 7)

/** Render `**word**` runs in the slide's accent colour + semibold. */
function Emphasis({ text, color }: { text: string; color: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <span key={i} style={{ color, fontWeight: 600 }}>
            {p.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** The lowercase "maverx" wordmark, drawn as styled text. */
function Wordmark({ color }: { color: string }) {
  return (
    <span
      style={{
        fontFamily: FONT_HEADING,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: "-0.02em",
        color,
      }}
    >
      maverx
    </span>
  );
}

/** Subtle geometric pattern echoing the cover slide's background texture. */
function PatternBackdrop({ color }: { color: string }) {
  return (
    <svg
      width={BASE_W}
      height={BASE_H}
      style={{ position: "absolute", inset: 0, opacity: 0.12 }}
      aria-hidden
    >
      <defs>
        <pattern id="mvx-grid" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M56 0 L0 0 0 56" fill="none" stroke={color} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width={BASE_W} height={BASE_H} fill="url(#mvx-grid)" />
    </svg>
  );
}

function CoverSlide({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(120% 120% at 80% -10%, ${MVX.deepPurple} 0%, ${MVX.coverBg} 55%)`,
        color: MVX.white,
      }}
    >
      <PatternBackdrop color={MVX.white} />
      <div style={{ position: "absolute", top: MARGIN, left: MARGIN }}>
        <Wordmark color={MVX.white} />
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          bottom: 170,
          right: MARGIN,
        }}
      >
        <div
          style={{
            width: 64,
            height: 8,
            borderRadius: 8,
            background: accent,
            marginBottom: 28,
          }}
        />
        <h1
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 26,
              marginTop: 20,
              color: "rgba(255,255,255,0.78)",
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          bottom: MARGIN,
          fontFamily: FONT_BODY,
          fontSize: 18,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        maverx.nl
      </div>
    </div>
  );
}

function SectionSlide({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: MVX.coverBg,
        color: MVX.white,
      }}
    >
      <PatternBackdrop color={accent} />
      <div style={{ position: "absolute", top: MARGIN, left: MARGIN }}>
        <Wordmark color={MVX.white} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: `0 ${MARGIN}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {slide.eyebrow && (
          <span
            style={{
              fontFamily: FONT_HEADING,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {slide.eyebrow}
          </span>
        )}
        <h1
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            margin: "14px 0 0",
            maxWidth: 980,
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 28,
              marginTop: 18,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

const LIGHT_BG: Record<string, string> = {
  content: MVX.white,
  example: MVX.bgLavender,
  exercise: MVX.bgOrange,
  wrapup: MVX.bgRose,
  agenda: MVX.white,
  timetable: MVX.white,
};

/** Header shared by all light slides: eyebrow + title + accent rule + mark. */
function LightHeader({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: MARGIN - 8,
          right: MARGIN,
        }}
      >
        <Wordmark color={MVX.primary} />
      </div>
      {slide.eyebrow && (
        <span
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {slide.eyebrow}
        </span>
      )}
      <h2
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          color: MVX.primary,
          margin: slide.eyebrow ? "8px 0 0" : 0,
          maxWidth: 1000,
        }}
      >
        {slide.title}
      </h2>
      <div
        style={{ width: 56, height: 6, borderRadius: 6, background: accent, marginTop: 18 }}
      />
    </>
  );
}

function ContentSlide({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  const bg = LIGHT_BG[slide.kind] ?? MVX.white;
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, color: MVX.grey }}>
      <div style={{ position: "absolute", inset: `${MARGIN}px ${MARGIN}px` }}>
        <LightHeader slide={slide} />
        <div
          style={{
            marginTop: 36,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 1040,
          }}
        >
          {(slide.bullets ?? []).map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                fontFamily: FONT_BODY,
                fontSize: 23,
                lineHeight: 1.35,
                color: MVX.primary,
              }}
            >
              <span
                style={{
                  marginTop: 11,
                  width: 9,
                  height: 9,
                  borderRadius: 9,
                  background: accent,
                  flexShrink: 0,
                }}
              />
              <span>
                <Emphasis text={b} color={accent} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgendaSlide({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  return (
    <div style={{ position: "absolute", inset: 0, background: MVX.white, color: MVX.grey }}>
      <div style={{ position: "absolute", inset: `${MARGIN}px ${MARGIN}px` }}>
        <LightHeader slide={slide} />
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 18 }}>
          {(slide.agenda ?? []).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
              <span
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 700,
                  fontSize: 30,
                  color: accent,
                  width: 44,
                }}
              >
                {i + 1}
              </span>
              <span>
                <span
                  style={{
                    fontFamily: FONT_HEADING,
                    fontWeight: 600,
                    fontSize: 26,
                    color: MVX.primary,
                  }}
                >
                  {item.label}
                </span>
                {item.desc && (
                  <span style={{ fontFamily: FONT_BODY, fontSize: 20, color: MVX.grey }}>
                    {"  —  " + item.desc}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimetableSlide({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  const rows = slide.rows ?? [];
  return (
    <div style={{ position: "absolute", inset: 0, background: MVX.white, color: MVX.grey }}>
      <div style={{ position: "absolute", inset: `${MARGIN}px ${MARGIN}px` }}>
        <LightHeader slide={slide} />
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "150px 220px 1fr",
              fontFamily: FONT_HEADING,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: MVX.white,
              background: accent,
              padding: "12px 18px",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <span>Time</span>
            <span>Module</span>
            <span>Activities</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 220px 1fr",
                padding: "14px 18px",
                background: i % 2 ? MVX.bgLavender : MVX.offWhite,
                fontFamily: FONT_BODY,
                fontSize: 18,
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: FONT_HEADING, fontWeight: 700, color: accent }}>
                {r.time}
              </span>
              <span style={{ fontFamily: FONT_HEADING, fontWeight: 600, color: MVX.primary }}>
                {r.module}
              </span>
              <span style={{ color: MVX.grey, lineHeight: 1.3 }}>{r.activities}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideInner({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "cover":
      return <CoverSlide slide={slide} />;
    case "section":
      return <SectionSlide slide={slide} />;
    case "agenda":
      return <AgendaSlide slide={slide} />;
    case "timetable":
      return <TimetableSlide slide={slide} />;
    default:
      return <ContentSlide slide={slide} />;
  }
}

/**
 * Renders a slide at the true 1280×720 design size and scales it to `width`, so
 * a 240px thumbnail and a full preview are pixel-identical, just scaled.
 */
export function SlideCanvas({
  slide,
  width,
  style,
}: {
  slide: Slide;
  width: number;
  style?: CSSProperties;
}) {
  const scale = width / BASE_W;
  return (
    <div
      style={{
        width,
        height: width * (BASE_H / BASE_W),
        overflow: "hidden",
        borderRadius: 8 * scale + 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          inset: 0,
        }}
      >
        <SlideInner slide={slide} />
      </div>
    </div>
  );
}
