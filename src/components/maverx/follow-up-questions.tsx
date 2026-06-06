"use client";

import { MessageSquareText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import type { IntakeFormData } from "~/components/maverx/types";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export interface GeneratedQuestion {
  id: string;
  question: string;
}

export interface FollowUpQuestionsProps {
  intakeData: IntakeFormData;
  questions: GeneratedQuestion[] | null;
  onComplete: (answers: Record<string, string>) => void;
  defaultAnswers?: Record<string, string>;
}

export function FollowUpQuestions({ intakeData: _intakeData, questions, onComplete, defaultAnswers }: FollowUpQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(defaultAnswers ?? {});

  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(answers);
  }

  const isLoading = questions === null;

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-10">
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
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-4 w-4 animate-pulse rounded-full" />
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded-md" />
                  </div>
                  <div className="bg-muted min-h-18 animate-pulse rounded-md" />
                </motion.div>
              ))
            : questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                  className="flex flex-col gap-1.5"
                >
                  <label className="flex items-start gap-1.5 text-sm font-medium">
                    <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    {q.question}
                  </label>
                  <Textarea
                    value={answers[q.id] ?? ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder="Share your thoughts…"
                    className="min-h-18 resize-none text-sm"
                    rows={2}
                  />
                </motion.div>
              ))}

          <Button type="submit" className="mt-2 w-full" size="lg" disabled={isLoading}>
            Generate Slides →
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
