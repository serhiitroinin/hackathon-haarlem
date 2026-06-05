"use client";

import { Check, MapPin } from "lucide-react";
import { motion } from "motion/react";

export type NoteCreatedOutput = {
  id: string;
  title: string;
  pinned: boolean;
};

/**
 * Generative UI: rendered in place of text when the `createNote` tool returns.
 * Motion spring entrance + a pop-in checkmark.
 */
export function NoteCreatedCard({ title, pinned }: NoteCreatedOutput) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="bg-card flex w-full max-w-sm items-center gap-3 rounded-xl border p-3 shadow-sm"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 18 }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"
      >
        <Check className="h-4 w-4" />
      </motion.div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">Saved to your notes</p>
      </div>
      {pinned && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-primary/10 text-primary ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs"
        >
          <MapPin className="h-3 w-3" /> pinned
        </motion.span>
      )}
    </motion.div>
  );
}
