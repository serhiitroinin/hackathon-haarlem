"use client";

import { Loader2, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  buildScaffold,
  computeBudget,
  describeBudget,
} from "~/lib/maverx/framework";
import { type Deck } from "./types";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const DURATIONS = [60, 90, 120, 180, 240];

export function GenerateTraining({
  deckId,
  defaultTopic,
  onGenerated,
  backHref,
}: {
  deckId: string;
  defaultTopic?: string;
  onGenerated: (deck: { title: string; slides: Deck["slides"] }) => void;
  backHref: string;
}) {
  const [topic, setTopic] = useState(defaultTopic ?? "");
  const [audience, setAudience] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("intermediate");
  const [duration, setDuration] = useState(180);
  const [objective, setObjective] = useState("");
  const [busy, setBusy] = useState(false);

  // Live, deterministic plan preview — "structure is computed".
  const plan = useMemo(() => {
    if (!duration) return null;
    const budget = computeBudget({
      topic: "x",
      audience: "x",
      level,
      durationMinutes: duration,
      objective: "x",
    });
    return { budget, slides: buildScaffold(budget).length };
  }, [duration, level]);

  const ready = topic.trim() && audience.trim() && objective.trim() && duration > 0;

  async function generate() {
    if (!ready) {
      toast.error("Fill in topic, audience, objective and duration");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/slides/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deckId,
          intake: {
            topic: topic.trim(),
            audience: audience.trim(),
            level,
            durationMinutes: duration,
            objective: objective.trim(),
          },
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { title: string; slides: Deck["slides"] };
      toast.success("Training generated — review the draft");
      onGenerated(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Wand2 className="text-primary h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight">Generate training</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="text-xs">
              ← Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-6">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
          {/* Intake */}
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Build a training from this project
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                The framework computes the structure and timing; the content model
                fills it, grounded in this project&apos;s context and sources.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="g-topic">Topic / skill</Label>
              <Input
                id="g-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Solution-focused intake conversations"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-audience">Audience</Label>
              <Input
                id="g-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Junior social workers, no prior method training"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="g-level">Knowledge level</Label>
                <select
                  id="g-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm capitalize"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g-duration">Duration (min)</Label>
                <Input
                  id="g-duration"
                  type="number"
                  min={30}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
                <div className="flex gap-1">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`rounded border px-1.5 py-0.5 text-[10px] transition ${
                        duration === d ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      {d >= 60 ? `${d / 60}h` : `${d}m`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="g-objective">Primary learning objective</Label>
              <Textarea
                id="g-objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="After this training, participants can…"
                rows={3}
              />
            </div>

            <Button onClick={generate} disabled={busy || !ready} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "Generating…" : "Generate training"}
            </Button>
          </div>

          {/* Computed plan preview */}
          <div className="bg-muted/40 h-fit rounded-xl border p-4">
            <p className="text-xs font-semibold tracking-wide uppercase">Computed plan</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Deterministic — from duration &amp; level, before any AI.
            </p>
            {plan ? (
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Modules</span>
                  <span className="font-semibold">{plan.budget.modules}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Slides</span>
                  <span className="font-semibold">~{plan.slides}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Per module</span>
                  <span className="font-semibold">{plan.budget.minutesPerModule} min</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Kick-off / Wrap-up</span>
                  <span className="font-semibold">
                    {plan.budget.kickoff} / {plan.budget.wrapup} min
                  </span>
                </div>
                {plan.budget.breaks > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Breaks</span>
                    <span className="font-semibold">{plan.budget.breaks} min</span>
                  </div>
                )}
                <p className="text-muted-foreground border-t pt-2 text-[11px]">
                  {describeBudget(plan.budget)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">Set a duration to preview.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
