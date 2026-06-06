"use client";

import { useCallback, useState } from "react";

import type { GeneratedQuestion } from "~/components/maverx/follow-up-questions";
import type { IntakeFormData } from "~/components/maverx/types";
import { WorkspaceHeader } from "~/components/maverx/workspace-header";
import { IntakeForm } from "~/components/maverx/intake-form";
import { FollowUpQuestions } from "~/components/maverx/follow-up-questions";
import { SlideGenerationLoader } from "~/components/maverx/slide-generation-loader";
import { SlideBuilder } from "~/components/builder/slide-builder";
import { SAMPLE_DECK, MOCK_DECK } from "~/components/builder/sample-deck";
import { DEMO_QUESTIONS, DEMO_ANSWERS } from "~/components/maverx/mock-data";
import { env } from "~/env.js";

export function MaverxWorkspace() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intakeData, setIntakeData] = useState<IntakeFormData | null>(null);
  const [loadingStep3, setLoadingStep3] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(env.NEXT_PUBLIC_DEMO_MODE === "true");

  function handleIntakeComplete(data: IntakeFormData) {
    setIntakeData(data);
    setStep(2);

    if (isDemoMode) {
      setGeneratedQuestions(DEMO_QUESTIONS);
      return;
    }

    setGeneratedQuestions(null);
    fetch("/api/maverx-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: data.topic,
        audience: data.audience,
        level: data.level,
        duration: data.duration,
        objective: data.objective,
        fileNames: data.files.map((f) => f.name),
      }),
    })
      .then((res) => res.json())
      .then((json) =>
        setGeneratedQuestions((json as { questions: GeneratedQuestion[] }).questions),
      )
      .catch(() => {
        setGeneratedQuestions([
          {
            id: "prior_experience",
            question: `What prior experience do participants have with ${data.topic}?`,
          },
          {
            id: "tools_scenarios",
            question: "Are there specific tools, systems, or scenarios you want covered?",
          },
          {
            id: "challenges",
            question: "What is the biggest challenge participants face today?",
          },
          {
            id: "examples",
            question: "Any examples or case studies you'd like included?",
          },
        ]);
      });
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
        {step === 1 && (
          <IntakeForm
            onComplete={handleIntakeComplete}
            onDemoFill={() => setIsDemoMode(true)}
            isDemoMode={isDemoMode}
          />
        )}
        {step === 2 && intakeData && (
          <FollowUpQuestions
            intakeData={intakeData}
            questions={generatedQuestions}
            onComplete={handleQuestionsComplete}
            defaultAnswers={isDemoMode ? DEMO_ANSWERS : undefined}
          />
        )}
        {step === 3 && loadingStep3 && <SlideGenerationLoader onDone={handleLoaderDone} />}
        {step === 3 && !loadingStep3 && (
          <SlideBuilder
            initialDeck={isDemoMode ? MOCK_DECK : SAMPLE_DECK}
            persistence={{ kind: "local" }}
          />
        )}
      </div>
    </div>
  );
}
