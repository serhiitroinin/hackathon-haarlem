"use client";

import {
  AlertTriangle,
  Check,
  CloudUpload,
  Download,
  Filter,
  History,
  Info,
  Loader2,
  Plus,
  Presentation,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "~/components/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { analyzeSlide, slideStatus, type Issue } from "./attention";
import { SAMPLE_DECK } from "./sample-deck";
import { SlideCanvas } from "./slide-canvas";
import {
  ACCENTS,
  BG_OPTIONS,
  COLOR_OPTIONS,
  SIZE_SCALE_PT,
  WEIGHT_OPTIONS,
  type AccentKey,
} from "./tokens";
import {
  EMPTY_NOTES,
  type Deck,
  type ElementStyle,
  type Slide,
  type SpeakerNotes,
} from "./types";

const STORAGE_KEY = "mvx-deck-v1";

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
  if (status === "warn") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
  if (status === "info") return <Info className="h-3.5 w-3.5 text-sky-500" />;
  return <Check className="h-3.5 w-3.5 text-emerald-500" />;
}

/** Human label for a selected element id. */
function elementLabel(id: string): string {
  if (id === "title") return "Title";
  if (id === "eyebrow") return "Eyebrow";
  if (id === "subtitle") return "Subtitle";
  const [kind, i, field] = id.split(":");
  if (kind === "bullet") return `Bullet ${Number(i) + 1}`;
  if (kind === "agenda") return `Agenda ${Number(i) + 1} · ${field}`;
  if (kind === "row") return `Row ${Number(i) + 1} · ${field}`;
  return "Element";
}

type Persistence = { kind: "local" } | { kind: "project"; deckId: string };

export function SlideBuilder({
  initialDeck,
  persistence = { kind: "local" },
  backHref = "/",
}: {
  initialDeck?: Deck;
  persistence?: Persistence;
  backHref?: string;
}) {
  const isProject = persistence.kind === "project";
  const deckId = persistence.kind === "project" ? persistence.deckId : "";

  const [deck, setDeck] = useState<Deck>(initialDeck ?? SAMPLE_DECK);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [exporting, setExporting] = useState(false);
  const [previewRef, previewWidth] = useWidth<HTMLDivElement>();

  const utils = api.useUtils();
  const save = api.deck.save.useMutation();
  const snapshot = api.deck.snapshot.useMutation();
  const restore = api.deck.restore.useMutation();
  const versions = api.deck.versions.useQuery({ deckId }, { enabled: isProject });

  // Local mode: load/persist from localStorage.
  useEffect(() => {
    if (isProject) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDeck(JSON.parse(raw) as Deck);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [isProject]);

  // Persist on change — localStorage (local) or debounced DB save (project).
  const firstSave = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (!isProject) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
      return;
    }
    if (firstSave.current) {
      firstSave.current = false;
      return; // don't re-save the freshly-loaded deck
    }
    setSaveState("saving");
    const t = setTimeout(() => {
      save.mutate(
        { deckId, slides: deck.slides, title: deck.title },
        { onSuccess: () => setSaveState("saved") },
      );
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, hydrated, isProject, deckId]);

  function saveVersion() {
    snapshot.mutate(
      { deckId, label: `${deck.slides.length} slides` },
      {
        onSuccess: () => {
          void utils.deck.versions.invalidate({ deckId });
          toast.success("Version saved");
        },
      },
    );
  }

  function restoreVersion(versionId: string) {
    restore.mutate(
      { deckId, versionId },
      {
        onSuccess: (d) => {
          setDeck({ title: d.title, slides: d.slides as unknown as Slide[] });
          setActive(0);
          setSelected(null);
          toast.success("Version restored");
        },
      },
    );
  }

  async function exportPptx() {
    setExporting(true);
    try {
      const res = await fetch("/api/deck/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deck }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deck.title || "maverx-deck"}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const slide = deck.slides[active];

  function updateActive(fn: (s: Slide) => Slide) {
    setDeck((d) => ({
      ...d,
      slides: d.slides.map((s, i) => (i === active ? fn(s) : s)),
    }));
  }

  function handleEditText(id: string, text: string) {
    updateActive((s) => {
      if (id === "title") return { ...s, title: text };
      if (id === "eyebrow") return { ...s, eyebrow: text };
      if (id === "subtitle") return { ...s, subtitle: text };
      const [kind, idx, field] = id.split(":");
      const i = Number(idx);
      if (kind === "bullet") {
        const bullets = [...(s.bullets ?? [])];
        bullets[i] = text;
        return { ...s, bullets };
      }
      if (kind === "agenda") {
        const agenda = [...(s.agenda ?? [])];
        const item = { ...agenda[i]! };
        if (field === "label") item.label = text;
        else item.desc = text;
        agenda[i] = item;
        return { ...s, agenda };
      }
      if (kind === "row") {
        const rows = [...(s.rows ?? [])];
        const row = { ...rows[i]! };
        if (field === "time") row.time = text;
        else if (field === "module") row.module = text;
        else row.activities = text;
        rows[i] = row;
        return { ...s, rows };
      }
      return s;
    });
  }

  function setOverride(id: string, patch: Partial<ElementStyle>) {
    updateActive((s) => {
      const overrides = { ...(s.overrides ?? {}) };
      const cur: ElementStyle = { ...(overrides[id] ?? {}), ...patch };
      (Object.keys(cur) as (keyof ElementStyle)[]).forEach((k) => {
        if (cur[k] === undefined) delete cur[k];
      });
      if (Object.keys(cur).length) overrides[id] = cur;
      else delete overrides[id];
      return { ...s, overrides };
    });
  }

  function patchNotes(patch: Partial<SpeakerNotes>) {
    updateActive((s) => ({ ...s, notes: { ...(s.notes ?? EMPTY_NOTES), ...patch } }));
  }

  const attentionCount = deck.slides.filter((s) => slideStatus(s) === "warn").length;
  const issues: Issue[] = slide ? analyzeSlide(slide) : [];
  const sel = selected ? slide?.overrides?.[selected] : undefined;

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
              {attentionCount} need attention
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" /> All on-brand
            </span>
          )}

          {isProject && (
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </>
              ) : saveState === "saved" ? (
                <>
                  <CloudUpload className="h-3 w-3" /> Saved
                </>
              ) : null}
            </span>
          )}

          {isProject && (
            <>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={saveVersion}>
                <Save className="h-3.5 w-3.5" /> Save version
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <History className="h-3.5 w-3.5" /> History
                    {versions.data && versions.data.length > 0 && (
                      <span className="text-muted-foreground">({versions.data.length})</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>Saved versions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(versions.data ?? []).length === 0 && (
                    <DropdownMenuItem disabled>No versions yet</DropdownMenuItem>
                  )}
                  {(versions.data ?? []).map((v) => (
                    <DropdownMenuItem key={v.id} onClick={() => restoreVersion(v.id)}>
                      <span className="flex-1 truncate">{v.label || "Snapshot"}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">
                        {new Date(v.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Button size="sm" className="gap-1.5 text-xs" onClick={exportPptx} disabled={exporting}>
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export .pptx
          </Button>

          {!isProject && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                setDeck(SAMPLE_DECK);
                setActive(0);
                setSelected(null);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="text-xs">
              ← Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Thumbnail rail */}
        <div className="bg-muted/30 flex w-56 shrink-0 flex-col border-r">
          <button
            onClick={() => setOnlyFlagged((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 border-b px-3 py-2 text-xs transition-colors",
              onlyFlagged ? "bg-amber-500/10 text-amber-600" : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            {onlyFlagged ? "Showing flagged only" : "Filter: needs attention"}
          </button>
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-3">
              {deck.slides.map((s, i) => {
                const status = slideStatus(s);
                if (onlyFlagged && status !== "warn") return null;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(i);
                      setSelected(null);
                    }}
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
              {onlyFlagged && attentionCount === 0 && (
                <p className="text-muted-foreground px-2 py-6 text-center text-xs">
                  Nothing needs attention 🎉
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Preview (inline editable) */}
        <div className="flex min-w-0 flex-1 flex-col items-center overflow-auto p-6">
          <div ref={previewRef} className="w-full max-w-4xl">
            {slide && (
              <SlideCanvas
                key={slide.id}
                slide={slide}
                width={previewWidth}
                editable
                selectedId={selected}
                onSelect={setSelected}
                onEditText={handleEditText}
              />
            )}
          </div>
          <p className="text-muted-foreground mt-2 w-full max-w-4xl text-xs">
            Click any text to edit it inline. Select an element to restyle it on the right.
          </p>

          <div className="mt-3 w-full max-w-4xl">
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

        {/* Dynamic inspector */}
        <ScrollArea className="w-80 shrink-0 border-l">
          {slide && (
            <div className="space-y-4 p-4">
              {/* Element inspector (shown when something is selected) */}
              {selected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      {elementLabel(selected)}
                    </p>
                    <button
                      onClick={() => setOverride(selected, { colorKey: undefined, sizePt: undefined, weight: undefined })}
                      className="text-muted-foreground hover:text-foreground text-[11px]"
                    >
                      Reset style
                    </button>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-[11px]">Colour</Label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.key}
                          title={c.label}
                          onClick={() => setOverride(selected, { colorKey: c.key })}
                          className={cn(
                            "h-7 w-7 rounded-md border ring-offset-1 transition",
                            sel?.colorKey === c.key && "ring-foreground ring-2",
                          )}
                          style={{ background: c.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-[11px]">Size (pt)</Label>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {SIZE_SCALE_PT.map((pt) => (
                        <button
                          key={pt}
                          onClick={() => setOverride(selected, { sizePt: pt })}
                          className={cn(
                            "rounded border px-2 py-1 text-[11px] transition",
                            sel?.sizePt === pt
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:bg-accent",
                          )}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-[11px]">Weight</Label>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {WEIGHT_OPTIONS.map((w) => (
                        <button
                          key={w.value}
                          onClick={() => setOverride(selected, { weight: w.value })}
                          className={cn(
                            "rounded border px-2 py-1 text-[11px] transition",
                            sel?.weight === w.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:bg-accent",
                          )}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selected.startsWith("bullet:") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive gap-1.5 text-xs"
                      onClick={() => {
                        const i = Number(selected.split(":")[1]);
                        updateActive((s) => ({
                          ...s,
                          bullets: (s.bullets ?? []).filter((_, j) => j !== i),
                        }));
                        setSelected(null);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete bullet
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Select an element on the slide to restyle it with brand colours,
                  sizes and weights.
                </p>
              )}

              {/* Slide-level controls */}
              <div className="space-y-3 border-t pt-3">
                <p className="text-xs font-semibold tracking-wide uppercase">Slide</p>
                <div>
                  <Label className="text-muted-foreground text-[11px]">Accent</Label>
                  <div className="mt-1.5 flex gap-2">
                    {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => updateActive((s) => ({ ...s, accent: key }))}
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

                {slide.kind !== "cover" && slide.kind !== "section" && (
                  <div>
                    <Label className="text-muted-foreground text-[11px]">Background</Label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {BG_OPTIONS.map((c) => (
                        <button
                          key={c.key}
                          title={c.label}
                          onClick={() => updateActive((s) => ({ ...s, background: c.key }))}
                          className={cn(
                            "h-7 w-7 rounded-md border ring-offset-1 transition",
                            slide.background === c.key && "ring-foreground ring-2",
                          )}
                          style={{ background: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {slide.bullets && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() =>
                      updateActive((s) => ({ ...s, bullets: [...(s.bullets ?? []), "New point"] }))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" /> Add bullet
                  </Button>
                )}
              </div>

              {/* Speaker notes */}
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-semibold tracking-wide uppercase">
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
                        {!val.trim() && <span className="text-amber-500"> · missing</span>}
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
