"use client";

import { useState } from "react";
import { toast } from "sonner";

import { FollowUpQuestions } from "~/components/maverx/follow-up-questions";
import { IntakeForm } from "~/components/maverx/intake-form";
import { SlideGenerationLoader } from "~/components/maverx/slide-generation-loader";
import { WorkspaceHeader } from "~/components/maverx/workspace-header";
import { type IntakeFormData } from "~/components/maverx/types";
import { api } from "~/trpc/react";
import { type Deck } from "./types";

/** Free-text duration ("3 hours", "90 min", "2h") → minutes. */
function parseDuration(s?: string): number {
  if (!s) return 120;
  const t = s.toLowerCase().trim();
  const h = /([\d.]+)\s*(h|hour|hours|uur)/.exec(t);
  if (h) return Math.max(30, Math.round(parseFloat(h[1]!) * 60));
  const m = /([\d.]+)\s*(m|min|minute|minuten)/.exec(t);
  if (m) return Math.max(30, Math.round(parseFloat(m[1]!)));
  const n = parseFloat(t);
  if (!isNaN(n)) return n <= 12 ? Math.round(n * 60) : Math.round(n); // "2" → 2h, "180" → 180m
  return 120;
}

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

/**
 * The unified build-training flow, hosted inside a project's slides page when the
 * deck is empty: Intake (details) → Refine (follow-ups) → REAL generation
 * (framework + project context/sources) → hands a draft back to the SlideBuilder.
 */
export function BuildTraining({
  deckId,
  projectId,
  onGenerated,
}: {
  deckId: string;
  projectId: string;
  onGenerated: (deck: { title: string; slides: Deck["slides"] }) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intake, setIntake] = useState<IntakeFormData | null>(null);
  const [progress, setProgress] = useState({ stage: "Starting…", done: 0, total: 0 });
  const [finished, setFinished] = useState(false);
  const driveImport = api.drive.importToProject.useMutation();

  async function generate(answers: Record<string, string>) {
    if (!intake) return;
    setProgress({ stage: "Starting…", done: 0, total: 0 });
    setFinished(false);
    setStep(3);
    try {
      // Fold any files attached in the intake into the project (grounding).
      if (intake.files.length) {
        const form = new FormData();
        form.append("projectId", projectId);
        for (const f of intake.files) form.append("files", f);
        await fetch("/api/upload", { method: "POST", body: form }).catch(() => undefined);
      }
      if (intake.driveFiles?.length) {
        await driveImport
          .mutateAsync({ projectId, fileIds: intake.driveFiles.map((f) => f.id) })
          .catch(() => undefined);
      }

      const followups = Object.values(answers)
        .map((v) => v?.trim())
        .filter(Boolean)
        .join("\n");
      const level = (LEVELS as readonly string[]).includes(intake.level)
        ? (intake.level as (typeof LEVELS)[number])
        : "intermediate";

      const res = await fetch("/api/slides/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deckId,
          intake: {
            topic: intake.topic,
            audience: intake.audience,
            level,
            durationMinutes: parseDuration(intake.duration),
            objective: intake.objective?.trim() || `Apply ${intake.topic} in practice`,
            context: followups || undefined,
          },
        }),
      });
      if (!res.ok || !res.body) throw new Error("Generation failed");

      // Read streamed NDJSON progress events.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: { title: string; slides: Deck["slides"] } | null = null;

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as {
            type: string;
            stage?: string;
            done?: number;
            total?: number;
            title?: string;
            slides?: Deck["slides"];
            message?: string;
          };
          if (ev.type === "progress") {
            setProgress({ stage: ev.stage ?? "", done: ev.done ?? 0, total: ev.total ?? 0 });
          } else if (ev.type === "done") {
            result = { title: ev.title ?? "", slides: ev.slides ?? [] };
          } else if (ev.type === "error") {
            throw new Error(ev.message ?? "Generation failed");
          }
        }
      }

      if (!result) throw new Error("Generation failed");
      setFinished(true);
      const deck = result;
      setTimeout(() => onGenerated(deck), 700); // let the "ready" state show briefly
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
      setStep(2);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WorkspaceHeader step={step} />
      <div className="flex min-h-0 flex-1 flex-col">
        {step === 1 && (
          <IntakeForm
            onComplete={(d) => {
              setIntake(d);
              setStep(2);
            }}
          />
        )}
        {step === 2 && intake && (
          <FollowUpQuestions intakeData={intake} onComplete={generate} />
        )}
        {step === 3 && (
          <SlideGenerationLoader
            stage={progress.stage}
            done={progress.done}
            total={progress.total}
            finished={finished}
          />
        )}
      </div>
    </div>
  );
}
