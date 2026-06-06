"use client";

import { MessageSquareText } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import type { IntakeFormData } from "~/components/maverx/types";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export interface FollowUpQuestionsProps {
  intakeData: IntakeFormData;
  onComplete: (answers: Record<string, string>) => void;
}

export function FollowUpQuestions({ intakeData, onComplete }: FollowUpQuestionsProps) {
  const questions = [
    {
      id: "prior_experience",
      label: `What prior experience do participants have with ${intakeData.topic}?`,
      placeholder: "e.g. They've used basic concepts but never applied them in production",
    },
    {
      id: "tools_scenarios",
      label: "Are there specific tools, systems, or scenarios you want covered?",
      placeholder: "e.g. We use Jira and Confluence, focus on sprint ceremonies",
    },
    {
      id: "challenges",
      label: "What is the biggest challenge participants face today?",
      placeholder: "e.g. They struggle with prioritisation under pressure",
    },
    {
      id: "examples",
      label: "Any examples or case studies you'd like included?",
      placeholder: "e.g. The Q3 incident where we missed the release deadline",
    },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [q.id, ""])),
  );

  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(answers);
  }

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <MessageSquareText className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">A few quick questions</h1>
            <p className="text-muted-foreground text-sm">
              Help us tailor the deck to your audience. All fields are optional.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 400, damping: 30 }}
              className="flex flex-col gap-1.5"
            >
              <label className="text-sm font-medium">{q.label}</label>
              <Textarea
                value={answers[q.id]}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="min-h-[72px] resize-none text-sm"
                rows={2}
              />
            </motion.div>
          ))}

          <Button type="submit" className="mt-2 w-full" size="lg">
            Generate Slides →
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
