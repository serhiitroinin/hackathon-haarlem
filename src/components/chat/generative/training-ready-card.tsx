"use client";

import { CheckCircle2, FileDown, FileText, Presentation } from "lucide-react";
import { motion } from "motion/react";

type GeneratedFile = { name: string; url: string };

export type TrainingReadyOutput = {
  id: string;
  title: string;
  slideCount: number;
  arcComplete: boolean;
  meta: {
    topic: string;
    audience: string;
    level: string;
    durationMinutes: number;
    objective: string;
  };
  files: { pptx: GeneratedFile; preBite: GeneratedFile; postBite: GeneratedFile };
};

function DownloadRow({
  icon,
  label,
  file,
}: {
  icon: React.ReactNode;
  label: string;
  file: GeneratedFile;
}) {
  return (
    <a
      href={file.url}
      download={file.name}
      className="group hover:bg-accent flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors"
    >
      <span className="text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-muted-foreground block truncate text-xs">{file.name}</span>
      </span>
      <FileDown className="text-muted-foreground group-hover:text-foreground h-4 w-4" />
    </a>
  );
}

/** Generative UI: rendered when the `generateTraining` tool returns. */
export function TrainingReadyCard(out: TrainingReadyOutput) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="bg-card w-full max-w-md rounded-xl border p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 18 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"
        >
          <CheckCircle2 className="h-5 w-5" />
        </motion.div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{out.title}</p>
          <p className="text-muted-foreground text-xs">
            {out.slideCount} slides · {out.meta.level} · {out.meta.durationMinutes} min
            {out.arcComplete ? " · full didactic arc" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <DownloadRow
          icon={<Presentation className="h-4 w-4" />}
          label="Training deck (.pptx)"
          file={out.files.pptx}
        />
        <DownloadRow
          icon={<FileText className="h-4 w-4" />}
          label="Pre-bite (.docx)"
          file={out.files.preBite}
        />
        <DownloadRow
          icon={<FileText className="h-4 w-4" />}
          label="Post-bite (.docx)"
          file={out.files.postBite}
        />
      </div>
    </motion.div>
  );
}
