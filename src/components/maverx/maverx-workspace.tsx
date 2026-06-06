"use client";

import { useCallback, useState } from "react";

import type { IntakeFormData } from "~/components/maverx/types";
import { WorkspaceHeader } from "~/components/maverx/workspace-header";
import { IntakeForm } from "~/components/maverx/intake-form";
import { FollowUpQuestions } from "~/components/maverx/follow-up-questions";
import { SlideGenerationLoader } from "~/components/maverx/slide-generation-loader";
import { SlideBuilder } from "~/components/builder/slide-builder";
import { SAMPLE_DECK } from "~/components/builder/sample-deck";

export function MaverxWorkspace() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intakeData, setIntakeData] = useState<IntakeFormData | null>(null);
  const [loadingStep3, setLoadingStep3] = useState(false);

  function handleIntakeComplete(data: IntakeFormData) {
    setIntakeData(data);
    setStep(2);
  }

  function handleQuestionsComplete(_answers: Record<string, string>) {
    setLoadingStep3(true);
    setStep(3);
  }

  const handleLoaderDone = useCallback(() => setLoadingStep3(false), []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkspaceHeader step={step} />

      <div className="flex min-h-0 flex-1 flex-col">
        {step === 1 && <IntakeForm onComplete={handleIntakeComplete} />}
        {step === 2 && intakeData && (
          <FollowUpQuestions intakeData={intakeData} onComplete={handleQuestionsComplete} />
        )}
        {step === 3 && loadingStep3 && (
          <SlideGenerationLoader onDone={handleLoaderDone} />
        )}
        {step === 3 && !loadingStep3 && (
          <SlideBuilder initialDeck={SAMPLE_DECK} persistence={{ kind: "local" }} />
        )}
      </div>
    </div>
  );
}
