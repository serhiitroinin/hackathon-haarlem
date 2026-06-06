"use client";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";

import type { ToolPart } from "~/components/maverx/types";
import { renderToolOutput } from "~/components/chat/generative/registry";

function ToolChip({ part }: { part: ToolPart }) {
  const name = part.type.replace(/^tool-/, "");
  const failed = part.state === "output-error";
  const isGenerating =
    name === "generateTraining" &&
    (part.state === "input-streaming" || part.state === "input-available");

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-orange-50 to-amber-50/30 p-4 shadow-md dark:from-orange-950/20 dark:to-amber-950/10">
          <div className="mb-4 flex items-center gap-2">
            <Loader2 className="text-primary h-4 w-4 animate-spin" />
            <span className="text-primary text-sm font-semibold">Building your training deck…</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-video overflow-hidden rounded-lg bg-white/80 shadow-sm dark:bg-white/10"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-muted to-muted/40" />
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Generating slides, speaker notes, pre-bite &amp; post-bite…
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-muted-foreground bg-accent/40 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
    >
      {failed ? (
        <CircleAlert className="text-destructive h-3.5 w-3.5" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      <Wrench className="h-3 w-3" />
      <span className="text-foreground font-medium">{name}</span>
      <span>{failed ? "failed" : "running…"}</span>
    </motion.div>
  );
}

export interface ToolPartViewProps {
  part: ToolPart;
}

export function ToolPartView({ part }: ToolPartViewProps) {
  if (part.state === "output-available") {
    const name = part.type.replace(/^tool-/, "");
    const ui = renderToolOutput(name, part.output);
    if (ui) return <>{ui}</>;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-muted-foreground bg-accent/40 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        <Wrench className="h-3 w-3" />
        <span className="text-foreground font-medium">{name}</span>
        <span>done</span>
      </motion.div>
    );
  }
  return <ToolChip part={part} />;
}
