"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

import { SlideCanvas } from "./slide-canvas";
import { type Deck, type FeedbackMsg, type SlideComment } from "./types";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(820);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

let pinSeq = 0;
const newId = () => `c${++pinSeq}-${Math.round(performance.now())}`;

export function DraftReview({
  deck,
  active,
  onActive,
  onAddComment,
  onDeleteComment,
  onAddFeedback,
  onDeleteFeedback,
  onRevise,
  revising,
  backHref,
}: {
  deck: Deck;
  active: number;
  onActive: (i: number) => void;
  onAddComment: (slideIndex: number, c: SlideComment) => void;
  onDeleteComment: (slideIndex: number, id: string) => void;
  onAddFeedback: (text: string) => void;
  onDeleteFeedback: (id: string) => void;
  onRevise: () => void;
  revising: boolean;
  backHref: string;
}) {
  const [stageRef, stageWidth] = useWidth<HTMLDivElement>();
  const [commenting, setCommenting] = useState(false);
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [draftText, setDraftText] = useState("");
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState("");

  const slide = deck.slides[active];
  const comments = slide?.comments ?? [];
  const totalComments = deck.slides.reduce((n, s) => n + (s.comments?.length ?? 0), 0);

  // Unified comment lists for the sidebar.
  const inlineItems = deck.slides.flatMap((s, slideIndex) =>
    (s.comments ?? []).map((c, idx) => ({
      id: c.id,
      slideIndex,
      slideTitle: s.title,
      n: idx + 1,
      text: c.text,
    })),
  );
  const generalItems: FeedbackMsg[] = deck.feedback ?? [];

  function onStageClick(e: React.MouseEvent) {
    if (!commenting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDraftPin({ x: Math.min(0.97, Math.max(0.03, x)), y: Math.min(0.97, Math.max(0.03, y)) });
    setDraftText("");
  }

  function commitPin() {
    if (!draftPin || !draftText.trim()) {
      setDraftPin(null);
      return;
    }
    onAddComment(active, { id: newId(), x: draftPin.x, y: draftPin.y, text: draftText.trim() });
    setDraftPin(null);
    setDraftText("");
    setCommenting(false);
  }

  function sendFeedback() {
    const t = feedbackInput.trim();
    if (!t) return;
    onAddFeedback(t);
    setFeedbackInput("");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-amber-700 uppercase dark:bg-amber-500/15 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Draft · review only
          </span>
          <span className="text-sm font-semibold tracking-tight">{deck.title}</span>
          <span className="text-muted-foreground text-xs">
            {deck.slides.length} slides · {totalComments} comment{totalComments === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRevise}
            disabled={revising}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700"
          >
            {revising ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {revising ? "Revising…" : "Revise with AI → Hi-fi"}
          </Button>
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="text-xs">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Slide rail */}
        <ScrollArea className="bg-muted/30 w-48 shrink-0 border-r">
          <div className="space-y-2 p-3">
            {deck.slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => onActive(i)}
                className={cn(
                  "relative block w-full rounded-lg border p-1 transition-all",
                  i === active
                    ? "border-amber-400 ring-2 ring-amber-300/40"
                    : "border-transparent hover:border-muted-foreground/30",
                )}
              >
                <SlideCanvas slide={s} width={158} />
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-muted-foreground text-[10px]">{i + 1}</span>
                  {(s.comments?.length ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                      <MessageSquarePlus className="h-3 w-3" />
                      {s.comments!.length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Proofing board */}
        <div
          className="relative flex min-w-0 flex-1 flex-col items-center justify-center overflow-auto p-8"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(120,120,140,0.18) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Button
              variant={commenting ? "default" : "outline"}
              size="sm"
              className={cn("gap-1.5 text-xs", commenting && "bg-amber-500 hover:bg-amber-600")}
              onClick={() => {
                setCommenting((v) => !v);
                setDraftPin(null);
              }}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {commenting ? "Click the slide to pin a comment" : "Add comment"}
            </Button>
          </div>

          <div ref={stageRef} className="w-full max-w-3xl">
            {/* Wrapper sized to the EXACT slide box so click fractions and pin
                positions share one coordinate space. */}
            <div
              className="relative mx-auto"
              style={{ width: stageWidth, height: (stageWidth * 9) / 16 }}
            >
              {slide && <SlideCanvas slide={slide} width={stageWidth} />}

              {/* Interaction + pins overlay, exactly over the canvas */}
              <div
                className={cn("absolute inset-0", commenting && "cursor-crosshair")}
                onClick={onStageClick}
              >
                {/* Existing pins */}
                {comments.map((c, idx) => (
                  <div
                    key={c.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPin((p) => (p === c.id ? null : c.id));
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-md ring-2 ring-white"
                    >
                      {idx + 1}
                    </motion.div>
                    <AnimatePresence>
                      {openPin === c.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute left-5 top-3 z-10 w-52 rounded-lg border bg-popover p-2.5 text-xs shadow-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="whitespace-pre-wrap">{c.text}</p>
                          <button
                            className="text-muted-foreground hover:text-destructive mt-1.5 flex items-center gap-1 text-[10px]"
                            onClick={() => {
                              onDeleteComment(active, c.id);
                              setOpenPin(null);
                            }}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Draft pin being written — dot centered exactly on the click */}
                {draftPin && (
                  <div
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${draftPin.x * 100}%`, top: `${draftPin.y * 100}%` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-md ring-2 ring-white">
                      {comments.length + 1}
                    </div>
                    <div className="absolute left-4 top-4 w-56 rounded-lg border bg-popover p-2 shadow-xl">
                      <textarea
                        autoFocus
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitPin();
                          if (e.key === "Escape") setDraftPin(null);
                        }}
                        placeholder="Leave a comment…"
                        rows={2}
                        className="w-full resize-none bg-transparent text-xs outline-none"
                      />
                      <div className="mt-1 flex justify-end gap-1">
                        <button
                          onClick={() => setDraftPin(null)}
                          className="text-muted-foreground rounded p-1 hover:bg-accent"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={commitPin}
                          disabled={!draftText.trim()}
                          className="rounded bg-amber-500 p-1 text-white disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Read-only draft. Pin comments on the slide or chat feedback on the right,
            then revise with AI.
          </p>
        </div>

        {/* Feedback rail */}
        <div className="flex w-80 shrink-0 flex-col border-l">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">
              Comments
              {inlineItems.length + generalItems.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {inlineItems.length + generalItems.length}
                </span>
              )}
            </p>
            <p className="text-muted-foreground text-xs">
              Pinned and general comments — all feed the AI revision.
            </p>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-3 py-3">
            {inlineItems.length + generalItems.length === 0 ? (
              <p className="text-muted-foreground px-1 py-6 text-center text-xs">
                No comments yet. Pin one on a slide, or add a general comment
                below — “punchier titles”, “add a privacy slide”.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Pinned / inline comments */}
                {inlineItems.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground px-1 text-[10px] font-semibold tracking-wide uppercase">
                      On slides
                    </p>
                    {inlineItems.map((it) => (
                      <button
                        key={it.id}
                        onClick={() => {
                          onActive(it.slideIndex);
                          setOpenPin(it.id);
                        }}
                        className="group flex w-full items-start gap-2.5 rounded-lg border-l-2 border-amber-400 bg-amber-50/60 px-2.5 py-2 text-left transition hover:bg-amber-100/70 dark:bg-amber-500/10 dark:hover:bg-amber-500/20"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                          {it.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                            <MapPin className="h-3 w-3" /> Slide {it.slideIndex + 1} ·{" "}
                            <span className="truncate">{it.slideTitle}</span>
                          </span>
                          <span className="mt-0.5 block text-xs">{it.text}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteComment(it.slideIndex, it.id);
                          }}
                          className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition group-hover:opacity-100"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </button>
                    ))}
                  </div>
                )}

                {/* General comments */}
                {generalItems.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground px-1 text-[10px] font-semibold tracking-wide uppercase">
                      General
                    </p>
                    {generalItems.map((m) => (
                      <div
                        key={m.id}
                        className="group flex items-start gap-2.5 rounded-lg border-l-2 border-indigo-400 bg-indigo-50/60 px-2.5 py-2 dark:bg-indigo-500/10"
                      >
                        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                        <span className="min-w-0 flex-1 text-xs">{m.text}</span>
                        <button
                          onClick={() => onDeleteFeedback(m.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition group-hover:opacity-100"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendFeedback();
                  }
                }}
                placeholder="Add a general comment…"
                rows={2}
                className="bg-muted/50 flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none"
              />
              <Button size="icon" onClick={sendFeedback} disabled={!feedbackInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
