"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";

import {
  ACCENTS,
  bgHex,
  colorHex,
  FONT_BODY,
  FONT_HEADING,
  MVX,
  PT_TO_PX,
} from "./tokens";
import { type ElementStyle, type Slide } from "./types";

const BASE_W = 1280;
const BASE_H = 720;
const MARGIN = 72; // safe-area margin (style guide slide 7)
const SELECT_RING = "#2563eb";

/* ---- editing context ----------------------------------------------------- */

type EditCtx = {
  editable: boolean;
  selectedId: string | null;
  overrides: Record<string, ElementStyle>;
  onSelect?: (id: string | null) => void;
  onEditText?: (id: string, text: string) => void;
};
const SlideEditContext = createContext<EditCtx>({
  editable: false,
  selectedId: null,
  overrides: {},
});

/** Apply a per-element override on top of a base style. */
function withOverride(base: CSSProperties, ov?: ElementStyle): CSSProperties {
  if (!ov) return base;
  return {
    ...base,
    ...(ov.colorKey ? { color: colorHex(ov.colorKey) } : {}),
    ...(ov.sizePt ? { fontSize: ov.sizePt * PT_TO_PX } : {}),
    ...(ov.weight ? { fontWeight: ov.weight } : {}),
  };
}

/** Render `**word**` runs in `accent`. Used in static (non-edit) mode only. */
function emphasize(text: string, accent: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <span key={i} style={{ color: accent, fontWeight: 600 }}>
        {p.slice(2, -2)}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

/**
 * A text element that is static when rendering thumbnails/exports, and a
 * selectable contentEditable region in the builder. Edits commit on blur; the
 * DOM text is kept in sync via a ref so React re-renders (e.g. a colour change)
 * never move the caret.
 */
function SlideText({
  id,
  style,
  text,
  accent,
  emphasis,
}: {
  id: string;
  style: CSSProperties;
  text: string;
  accent: string;
  /** Render **word** emphasis in static mode. */
  emphasis?: boolean;
}) {
  const ctx = useContext(SlideEditContext);
  const ref = useRef<HTMLDivElement>(null);
  const finalStyle = withOverride(style, ctx.overrides[id]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerText !== text)
      el.innerText = text ?? "";
  }, [text]);

  if (!ctx.editable) {
    return (
      <div style={finalStyle}>
        {emphasis ? emphasize(text, accent) : text}
      </div>
    );
  }

  const selected = ctx.selectedId === id;
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      suppressHydrationWarning
      spellCheck={false}
      style={{
        ...finalStyle,
        outline: selected ? `2px solid ${SELECT_RING}` : "none",
        outlineOffset: 6,
        borderRadius: 3,
        cursor: "text",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onFocus={() => ctx.onSelect?.(id)}
      onBlur={(e) => ctx.onEditText?.(id, e.currentTarget.innerText)}
    />
  );
}

/* ---- decorative bits ----------------------------------------------------- */

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

/* ---- slide layouts ------------------------------------------------------- */

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
      <div style={{ position: "absolute", left: MARGIN, bottom: 170, right: MARGIN }}>
        <div
          style={{ width: 64, height: 8, borderRadius: 8, background: accent, marginBottom: 28 }}
        />
        <SlideText
          id="title"
          accent={accent}
          text={slide.title}
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        />
        {slide.subtitle !== undefined && (
          <SlideText
            id="subtitle"
            accent={accent}
            text={slide.subtitle}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 26,
              marginTop: 20,
              color: "rgba(255,255,255,0.78)",
            }}
          />
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
    <div style={{ position: "absolute", inset: 0, background: MVX.coverBg, color: MVX.white }}>
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
        {slide.eyebrow !== undefined && (
          <SlideText
            id="eyebrow"
            accent={accent}
            text={slide.eyebrow}
            style={{
              fontFamily: FONT_HEADING,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: accent,
            }}
          />
        )}
        <SlideText
          id="title"
          accent={accent}
          text={slide.title}
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            marginTop: 14,
            maxWidth: 980,
          }}
        />
        {slide.subtitle !== undefined && (
          <SlideText
            id="subtitle"
            accent={accent}
            text={slide.subtitle}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 28,
              marginTop: 18,
              color: "rgba(255,255,255,0.75)",
            }}
          />
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

function LightHeader({ slide, accent }: { slide: Slide; accent: string }) {
  return (
    <>
      <div style={{ position: "absolute", top: MARGIN - 8, right: MARGIN }}>
        <Wordmark color={MVX.primary} />
      </div>
      {slide.eyebrow !== undefined && (
        <SlideText
          id="eyebrow"
          accent={accent}
          text={slide.eyebrow}
          style={{
            fontFamily: FONT_HEADING,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: accent,
          }}
        />
      )}
      <SlideText
        id="title"
        accent={accent}
        text={slide.title}
        style={{
          fontFamily: FONT_HEADING,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          color: MVX.primary,
          marginTop: slide.eyebrow !== undefined ? 8 : 0,
          maxWidth: 1000,
        }}
      />
      <div
        style={{ width: 56, height: 6, borderRadius: 6, background: accent, marginTop: 18 }}
      />
    </>
  );
}

function ContentSlide({ slide }: { slide: Slide }) {
  const accent = ACCENTS[slide.accent];
  const bg = bgHex(slide.background) ?? LIGHT_BG[slide.kind] ?? MVX.white;
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, color: MVX.grey }}>
      <div style={{ position: "absolute", inset: `${MARGIN}px ${MARGIN}px` }}>
        <LightHeader slide={slide} accent={accent} />
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
              style={{ display: "flex", gap: 16, color: MVX.primary }}
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
              <SlideText
                id={`bullet:${i}`}
                accent={accent}
                text={b}
                emphasis
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 23,
                  lineHeight: 1.35,
                  color: MVX.primary,
                  flex: 1,
                }}
              />
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
        <LightHeader slide={slide} accent={accent} />
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
              <SlideText
                id={`agenda:${i}:label`}
                accent={accent}
                text={item.label}
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 600,
                  fontSize: 26,
                  color: MVX.primary,
                }}
              />
              {item.desc !== undefined && (
                <SlideText
                  id={`agenda:${i}:desc`}
                  accent={accent}
                  text={item.desc}
                  style={{ fontFamily: FONT_BODY, fontSize: 20, color: MVX.grey }}
                />
              )}
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
        <LightHeader slide={slide} accent={accent} />
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
                alignItems: "center",
              }}
            >
              <SlideText
                id={`row:${i}:time`}
                accent={accent}
                text={r.time}
                style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 18, color: accent }}
              />
              <SlideText
                id={`row:${i}:module`}
                accent={accent}
                text={r.module}
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 600,
                  fontSize: 18,
                  color: MVX.primary,
                }}
              />
              <SlideText
                id={`row:${i}:activities`}
                accent={accent}
                text={r.activities}
                style={{ fontFamily: FONT_BODY, fontSize: 18, color: MVX.grey, lineHeight: 1.3 }}
              />
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
 * Renders a slide at the true 1280×720 design size and scales it to `width`.
 * Pass edit props to make text inline-editable + selectable (builder preview);
 * omit them for static thumbnails/exports.
 */
export function SlideCanvas({
  slide,
  width,
  style,
  editable = false,
  selectedId = null,
  onSelect,
  onEditText,
}: {
  slide: Slide;
  width: number;
  style?: CSSProperties;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onEditText?: (id: string, text: string) => void;
}) {
  const scale = width / BASE_W;
  return (
    <SlideEditContext.Provider
      value={{ editable, selectedId, overrides: slide.overrides ?? {}, onSelect, onEditText }}
    >
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
          onMouseDown={editable ? () => onSelect?.(null) : undefined}
        >
          <SlideInner slide={slide} />
        </div>
      </div>
    </SlideEditContext.Provider>
  );
}
