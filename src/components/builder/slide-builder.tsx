"use client";

import {
  AlertTriangle,
  Check,
  Info,
  Presentation,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "~/components/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

import { analyzeSlide, slideStatus, type Issue } from "./attention";
import { SAMPLE_DECK } from "./sample-deck";
import { SlideCanvas } from "./slide-canvas";
import { ACCENTS, type AccentKey } from "./tokens";
import { EMPTY_NOTES, type Deck, type Slide, type SpeakerNotes } from "./types";

const STORAGE_KEY = "mvx-deck-v1";

/** Measure a container's pixel width (so SlideCanvas can scale to fit). */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(880);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function StatusDot({ status }: { status: "warn" | "info" | null }) {
  if (status === "warn")
    return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
  if (status === "info") return <Info className="h-3.5 w-3.5 text-sky-500" />;
  return <Check className="h-3.5 w-3.5 text-emerald-500" />;
}

export function SlideBuilder() {
  const [deck, setDeck] = useState<Deck>(SAMPLE_DECK);
  const [active, setActive] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [previewRef, previewWidth] = useWidth<HTMLDivElement>();

  // Load any saved deck after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDeck(JSON.parse(raw) as Deck);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change (once hydrated, so we don't clobber storage on first paint).
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
  }, [deck, hydrated]);

  const slide = deck.slides[active];

  function patchSlide(patch: Partial<Slide>) {
    setDeck((d) => ({
      ...d,
      slides: d.slides.map((s, i) => (i === active ? { ...s, ...patch } : s)),
    }));
  }
  function patchNotes(patch: Partial<SpeakerNotes>) {
    patchSlide({ notes: { ...(slide?.notes ?? EMPTY_NOTES), ...patch } });
  }

  const attentionCount = deck.slides.filter(
    (s) => slideStatus(s) === "warn",
  ).length;

  const issues: Issue[] = slide ? analyzeSlide(slide) : [];

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Presentation className="text-primary h-5 w-5" />
          <input
            value={deck.title}
            onChange={(e) => setDeck((d) => ({ ...d, title: e.target.value }))}
            className="bg-transparent text-sm font-semibold tracking-tight outline-none"
          />
          <Badge variant="secondary" className="ml-1 text-[10px]">
            Maverx style
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {attentionCount > 0 ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              {attentionCount} slide{attentionCount > 1 ? "s" : ""} need attention
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" /> All slides on-brand
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              setDeck(SAMPLE_DECK);
              setActive(0);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs">
              ← Projects
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Thumbnail rail */}
        <ScrollArea className="bg-muted/30 w-56 shrink-0 border-r">
          <div className="space-y-2 p-3">
            {deck.slides.map((s, i) => {
              const status = slideStatus(s);
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className={cn(
                    "block w-full rounded-lg border p-1 text-left transition-all",
                    i === active
                      ? "border-primary ring-primary/30 ring-2"
                      : "border-transparent hover:border-muted-foreground/30",
                  )}
                >
                  <SlideCanvas slide={s} width={190} />
                  <div className="flex items-center justify-between px-1 py-1">
                    <span className="text-muted-foreground text-[10px]">
                      {i + 1}. {s.kind}
                    </span>
                    <StatusDot status={status} />
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Preview */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-start overflow-auto p-6">
          <div ref={previewRef} className="w-full max-w-4xl">
            {slide && <SlideCanvas slide={slide} width={previewWidth} />}
          </div>

          {/* Attention for this slide */}
          <div className="mt-4 w-full max-w-4xl">
            {issues.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-emerald-600">
                <Check className="h-4 w-4" /> This slide follows the style guide.
              </p>
            ) : (
              <div className="space-y-1.5">
                {issues.map((iss, i) => (
                  <p
                    key={i}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      iss.severity === "warn"
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-muted-foreground",
                    )}
                  >
                    {iss.severity === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    {iss.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor panel */}
        <ScrollArea className="w-80 shrink-0 border-l">
          {slide && (
            <div className="space-y-4 p-4">
              <div>
                <Label className="text-xs">Eyebrow</Label>
                <Input
                  value={slide.eyebrow ?? ""}
                  onChange={(e) => patchSlide({ eyebrow: e.target.value })}
                  placeholder="e.g. Topic 1 · Theory"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Textarea
                  value={slide.title}
                  onChange={(e) => patchSlide({ title: e.target.value })}
                  rows={2}
                  className="mt-1"
                />
              </div>
              {(slide.kind === "cover" || slide.kind === "section") && (
                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={slide.subtitle ?? ""}
                    onChange={(e) => patchSlide({ subtitle: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Accent picker */}
              <div>
                <Label className="text-xs">Accent</Label>
                <div className="mt-1.5 flex gap-2">
                  {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => patchSlide({ accent: key })}
                      aria-label={key}
                      className={cn(
                        "h-7 w-7 rounded-full ring-offset-2 transition",
                        slide.accent === key && "ring-foreground ring-2",
                      )}
                      style={{ background: ACCENTS[key] }}
                    />
                  ))}
                </div>
              </div>

              {/* Bullets (content-style slides) */}
              {slide.bullets && (
                <div>
                  <Label className="text-xs">
                    Body — one bullet per line, <code>**word**</code> = accent
                  </Label>
                  <Textarea
                    value={slide.bullets.join("\n")}
                    onChange={(e) =>
                      patchSlide({
                        bullets: e.target.value.split("\n").filter((l) => l.length),
                      })
                    }
                    rows={6}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              )}

              {/* Speaker notes */}
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium tracking-wide uppercase">
                  Speaker notes
                </p>
                {(
                  [
                    ["aim", "Aim"],
                    ["time", "Time"],
                    ["instructions", "Instructions"],
                    ["keyPoints", "Key discussion points"],
                    ["linkToReality", "Link to reality"],
                    ["debrief", "Debrief & summary"],
                  ] as [keyof SpeakerNotes, string][]
                ).map(([key, label]) => {
                  const val = slide.notes?.[key] ?? "";
                  return (
                    <div key={key} className="mb-2">
                      <Label className="text-muted-foreground text-[11px]">
                        {label}
                        {!val.trim() && (
                          <span className="text-amber-500"> · missing</span>
                        )}
                      </Label>
                      <Textarea
                        value={val}
                        onChange={(e) => patchNotes({ [key]: e.target.value })}
                        rows={key === "instructions" ? 3 : 1}
                        className="mt-1 text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
