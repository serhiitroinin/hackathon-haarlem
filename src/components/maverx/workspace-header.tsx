"use client";

import { Check, GraduationCap } from "lucide-react";
import Image from "next/image";

import { cn } from "~/lib/utils";

export interface WorkspaceHeaderProps {
  step: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: "Training Details" },
  { number: 2, label: "Refine" },
  { number: 3, label: "Your Slides" },
] as const;

export function WorkspaceHeader({ step }: WorkspaceHeaderProps) {
  return (
    <header className="border-b bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/maverx-logo.png"
            alt="Maverx"
            width={100}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <div className="bg-border h-5 w-px" />
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary h-4 w-4" />
            <span className="text-sm font-semibold">Training Builder</span>
          </div>

          <div className="bg-border h-5 w-px" />

          {/* Step indicator */}
          <nav className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const done = step > s.number;
              const active = step === s.number;
              return (
                <div key={s.number} className="flex items-center gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : done
                          ? "text-emerald-600"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {done ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                          active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20",
                        )}
                      >
                        {s.number}
                      </span>
                    )}
                    {s.label}
                  </div>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-px w-6 rounded-full transition-colors",
                        step > s.number ? "bg-emerald-400" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
            AI-Powered
          </span>
        </div>
      </div>
    </header>
  );
}
