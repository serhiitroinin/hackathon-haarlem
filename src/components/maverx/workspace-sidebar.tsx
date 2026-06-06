"use client";

import { CheckCircle2, FileSliders, Layers } from "lucide-react";

import type { IntakeStepId, StepStatus } from "~/components/maverx/types";
import { DIDACTIC_BLOCKS, DELIVERABLES } from "~/components/maverx/constants";
import { IntakeStepper } from "~/components/maverx/intake-stepper";

export interface WorkspaceSidebarProps {
  statuses: Record<IntakeStepId, StepStatus>;
  isGenerating: boolean;
}

export function WorkspaceSidebar({ statuses, isGenerating }: WorkspaceSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r bg-card px-4 py-5 pb-8">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <FileSliders className="text-primary h-4 w-4" />
          <h2 className="text-sm font-semibold">Intake Checklist</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-xs">
          I need these 5 answers before generating your deck.
        </p>
        <IntakeStepper statuses={statuses} isGenerating={isGenerating} />
      </div>

      {/* Didactic model legend */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Layers className="text-primary h-4 w-4" />
          <h2 className="text-sm font-semibold">Didactic Model</h2>
        </div>
        <div className="flex flex-col gap-1">
          {DIDACTIC_BLOCKS.map(({ block, desc }, i) => (
            <div
              key={block}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            >
              <span className="text-primary/40 w-4 text-right text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-xs font-medium">{block}</span>
              <span className="text-muted-foreground text-xs">— {desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Output legend */}
      <div className="rounded-xl border bg-muted/40 px-3 py-3">
        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
          What you&apos;ll get
        </p>
        <ul className="flex flex-col gap-1">
          {DELIVERABLES.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
