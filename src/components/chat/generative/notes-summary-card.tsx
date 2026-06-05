"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";

export type NotesSummaryOutput = {
  total: number;
  pinned: number;
  byDay: { date: string; count: number }[];
  recent: string[];
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-semibold tabular-nums">
        <NumberFlow value={value} />
      </div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}

/**
 * Generative UI: rendered when the `summarizeNotes` tool returns. Animated
 * counters (NumberFlow), Motion-animated bars, and a staggered recent list —
 * a real component the model produced, not a wall of text.
 */
export function NotesSummaryCard({
  total,
  pinned,
  byDay,
  recent,
}: NotesSummaryOutput) {
  const max = Math.max(1, ...byDay.map((d) => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      className="bg-card w-full max-w-sm rounded-xl border p-4 shadow-sm"
    >
      <div className="flex gap-8">
        <Stat label="Notes" value={total} />
        <Stat label="Pinned" value={pinned} />
      </div>

      {byDay.length > 0 && (
        <div className="mt-4 flex h-16 items-end gap-1">
          {byDay.map((d, i) => (
            <motion.div
              key={d.date}
              initial={{ height: 0 }}
              animate={{ height: `${(d.count / max) * 100}%` }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
              className="bg-primary/70 min-h-[4px] flex-1 rounded-t"
              title={`${d.date}: ${d.count}`}
            />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <ul className="mt-4 space-y-1">
          {recent.map((title, i) => (
            <motion.li
              key={`${title}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="text-muted-foreground truncate text-xs"
            >
              · {title}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
