"use client";

import { useState } from "react";

import type { IntakeFormData } from "~/components/maverx/types";
import { WorkspaceHeader } from "~/components/maverx/workspace-header";
import { IntakeForm } from "~/components/maverx/intake-form";
import { FollowUpQuestions } from "~/components/maverx/follow-up-questions";
import { SlideBuilder } from "~/components/builder/slide-builder";
import { SAMPLE_DECK } from "~/components/builder/sample-deck";

export function MaverxWorkspace() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intakeData, setIntakeData] = useState<IntakeFormData | null>(null);

  function handleIntakeComplete(data: IntakeFormData) {
    setIntakeData(data);
    setStep(2);
  }

  function handleQuestionsComplete(_answers: Record<string, string>) {
    setStep(3);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkspaceHeader step={step} />

      <div className="flex min-h-0 flex-1 flex-col">
        {step === 1 && <IntakeForm onComplete={handleIntakeComplete} />}
        {step === 2 && intakeData && (
          <FollowUpQuestions intakeData={intakeData} onComplete={handleQuestionsComplete} />
        )}
        {step === 3 && (
          <SlideBuilder initialDeck={SAMPLE_DECK} persistence={{ kind: "local" }} />
        )}
      </div>
    </div>
  );
}
