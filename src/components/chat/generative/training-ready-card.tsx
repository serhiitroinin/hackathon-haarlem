"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Presentation,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "~/components/ui/badge";

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

const ARC_STEPS = [
  { key: "kickoff", label: "Kick-off" },
  { key: "theory", label: "Theory" },
  { key: "example", label: "Example" },
  { key: "exercise", label: "Exercise" },
  { key: "wrapup", label: "Wrap-up" },
] as const;

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function DownloadRow({
  icon,
  label,
  sublabel,
  file,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  file: GeneratedFile;
  primary?: boolean;
}) {
  return (
    <a
      href={file.url}
      download={file.name}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-md ${
        primary
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/60"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          primary ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${primary ? "text-primary" : ""}`}>
          {label}
        </span>
        <span className="text-muted-foreground block truncate text-xs">{sublabel}</span>
      </span>
      <Download className="text-muted-foreground h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export function TrainingReadyCard(out: TrainingReadyOutput) {
  const hours = Math.floor(out.meta.durationMinutes / 60);
  const mins = out.meta.durationMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="bg-card w-full max-w-lg overflow-hidden rounded-2xl border shadow-lg"
    >
      {/* Header */}
      <div className="border-b bg-gradient-to-br from-orange-50 to-amber-50/40 px-5 py-4 dark:from-orange-950/30 dark:to-amber-950/10">
        <div className="mb-3 flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 500, damping: 20 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
          <div>
            <p className="text-base font-bold leading-tight">{out.title}</p>
            <p className="text-muted-foreground text-xs">Training deck ready</p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <Presentation className="h-3 w-3" />
            {out.slideCount} slides
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <Clock className="h-3 w-3" />
            {durationLabel}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <Users className="h-3 w-3" />
            {out.meta.audience}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <BookOpen className="h-3 w-3" />
            {LEVEL_LABEL[out.meta.level] ?? out.meta.level}
          </Badge>
        </div>
      </div>

      {/* Didactic arc */}
      <div className="border-b px-5 py-3">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          Didactic Arc
        </p>
        <div className="flex items-center gap-1">
          {ARC_STEPS.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 500, damping: 24 }}
              className="flex items-center gap-1"
            >
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                  out.arcComplete
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {out.arcComplete && <CheckCircle2 className="h-2.5 w-2.5" />}
                {step.label}
              </span>
              {i < ARC_STEPS.length - 1 && (
                <ChevronRight className="text-muted-foreground/40 h-3 w-3 shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Downloads */}
      <div className="flex flex-col gap-2 p-4">
        <DownloadRow
          icon={<Presentation className="h-4 w-4" />}
          label="Training Deck"
          sublabel={`${out.files.pptx.name} · Editable .pptx`}
          file={out.files.pptx}
          primary
        />
        <DownloadRow
          icon={<FileText className="h-4 w-4" />}
          label="Pre-bite"
          sublabel={`${out.files.preBite.name} · Participant preparation`}
          file={out.files.preBite}
        />
        <DownloadRow
          icon={<FileText className="h-4 w-4" />}
          label="Post-bite"
          sublabel={`${out.files.postBite.name} · Follow-up assignment`}
          file={out.files.postBite}
        />
      </div>
    </motion.div>
  );
}
