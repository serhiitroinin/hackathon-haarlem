"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";

import type { IntakeStepId, StepStatus } from "~/components/maverx/types";
import { INTAKE_STEPS } from "~/components/maverx/constants";
import { cn } from "~/lib/utils";

export interface IntakeStepperProps {
  statuses: Record<IntakeStepId, StepStatus>;
  isGenerating: boolean;
}

export function IntakeStepper({ statuses, isGenerating }: IntakeStepperProps) {
  const confirmedCount = Object.values(statuses).filter((s) => s === "confirmed").length;
  const allConfirmed = confirmedCount === INTAKE_STEPS.length;

  return (
    <div className="flex flex-col gap-1">
      {INTAKE_STEPS.map((step, i) => {
        const status = statuses[step.id];
        const Icon = step.icon;
        return (
          <motion.div
            key={step.id}
            initial={false}
            animate={{
              opacity: status === "pending" ? 0.5 : 1,
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
              status === "confirmed" && "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20",
              status === "discussed" && "border-primary/20 bg-primary/5",
              status === "pending" && "bg-transparent",
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                status === "confirmed" &&
                  "border-emerald-500 bg-emerald-500 text-white",
                status === "discussed" &&
                  "border-primary bg-primary/10 text-primary",
                status === "pending" &&
                  "border-muted-foreground/30 text-muted-foreground/50",
              )}
            >
              {status === "confirmed" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 22 }}
                >
                  <Check className="h-3 w-3" />
                </motion.div>
              ) : status === "discussed" ? (
                <motion.div
                  animate={{ rotate: isGenerating ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isGenerating ? Infinity : 0 }}
                >
                  <Icon className="h-3 w-3" />
                </motion.div>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold",
                  status === "confirmed" && "text-emerald-700 dark:text-emerald-400",
                  status === "discussed" && "text-primary",
                  status === "pending" && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              <p className="text-muted-foreground truncate text-xs">{step.description}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Progress footer */}
      <motion.div
        className="mt-2 overflow-hidden rounded-full bg-muted"
        style={{ height: 4 }}
      >
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors",
            allConfirmed ? "bg-emerald-500" : "bg-primary",
          )}
          initial={{ width: "0%" }}
          animate={{ width: `${(confirmedCount / INTAKE_STEPS.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </motion.div>
      <p className="text-muted-foreground text-center text-xs">
        {confirmedCount}/{INTAKE_STEPS.length} intake fields
      </p>
    </div>
  );
}
