"use client";

import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "Analysing your requirements…",
  "Designing slide structure…",
  "Generating cover slide…",
  "Writing speaker notes…",
  "Adding exercises…",
  "Building timetable…",
  "Applying Maverx style…",
  "Checking quality…",
  "Finalising your deck…",
];

const SLIDE_COUNT = 9;
const STAGGER_MS = 380;
const DONE_DELAY_MS = 600;

const SLIDE_LABELS = [
  "Cover",
  "About",
  "Timetable",
  "Introduction",
  "Example",
  "Exercise",
  "Wrap-up",
  "Notes",
  "Next Steps",
];

function SlideThumbnail({ index, visible }: { index: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="relative aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted/60 p-2.5 shadow-sm"
        >
          {/* shimmer sweep */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ translateX: ["−100%", "200%"] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
          />

          {/* slide number badge */}
          <span className="absolute right-1.5 top-1.5 rounded bg-background/60 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {index + 1}
          </span>

          {/* eyebrow skeleton */}
          <div className="mb-1.5 h-1.5 w-1/3 rounded-full bg-primary/20" />

          {/* title skeleton */}
          <div className="mb-2 h-3 w-4/5 rounded-full bg-foreground/20" />

          {/* bullet skeletons */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-muted-foreground/20" />
            <div className="h-1.5 w-5/6 rounded-full bg-muted-foreground/15" />
            <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/10" />
          </div>

          {/* label */}
          <div className="absolute bottom-2 left-2.5 text-[9px] font-medium text-muted-foreground/60">
            {SLIDE_LABELS[index]}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SlideGenerationLoader({ onDone }: { onDone: () => void }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // reveal slides one by one
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < SLIDE_COUNT; i++) {
      timers.push(
        setTimeout(() => setRevealedCount(i + 1), (i + 1) * STAGGER_MS),
      );
    }
    // mark done after all slides + brief pause
    const doneTimer = setTimeout(
      () => setDone(true),
      SLIDE_COUNT * STAGGER_MS + DONE_DELAY_MS,
    );
    // call onDone 600 ms after done state
    const exitTimer = setTimeout(
      () => onDone(),
      SLIDE_COUNT * STAGGER_MS + DONE_DELAY_MS + 600,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  // cycle status messages
  useEffect(() => {
    if (done) return;
    const interval = setInterval(
      () => setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length),
      650,
    );
    return () => clearInterval(interval);
  }, [done]);

  const progress = Math.round((revealedCount / SLIDE_COUNT) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 shadow-xl"
      >
        {/* header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            animate={done ? { scale: 1.1 } : { rotate: 360 }}
            transition={
              done
                ? { type: "spring", stiffness: 300, damping: 15 }
                : { duration: 3, repeat: Infinity, ease: "linear" }
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>

          <div>
            <h2 className="text-base font-semibold tracking-tight">
              {done ? "Your deck is ready!" : "AI is building your deck…"}
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={done ? "done" : statusIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="mt-0.5 text-sm text-muted-foreground"
              >
                {done ? "Opening slide editor…" : STATUS_MESSAGES[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* slide grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <SlideThumbnail key={i} index={i} visible={i < revealedCount} />
          ))}
        </div>

        {/* progress bar + counter */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{done ? "✓ All slides generated" : `${revealedCount} of ${SLIDE_COUNT} slides`}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
