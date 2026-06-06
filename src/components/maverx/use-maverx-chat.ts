"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useMemo, useRef, useEffect, useState } from "react";

import type { IntakeStepId, StepStatus, ToolPart } from "~/components/maverx/types";
import { INTAKE_STEPS } from "~/components/maverx/constants";

function detectIntakeProgress(
  messages: { role: string; parts: { type: string; text?: string }[] }[],
  isGenerating: boolean,
): Record<IntakeStepId, StepStatus> {
  const allText = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => p.text ?? ""))
    .join(" ");

  const userText = messages
    .filter((m) => m.role === "user")
    .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => p.text ?? ""))
    .join(" ");

  const combined = allText + " " + userText;

  const result = {} as Record<IntakeStepId, StepStatus>;
  for (const step of INTAKE_STEPS) {
    const hit = step.patterns.some((p) => p.test(combined));
    if (isGenerating) {
      result[step.id] = "confirmed";
    } else if (hit) {
      const recentAssistant = messages
        .filter((m) => m.role === "assistant")
        .slice(-2)
        .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => p.text ?? ""))
        .join(" ");
      result[step.id] = step.patterns.some((p) => p.test(recentAssistant))
        ? "confirmed"
        : "discussed";
    } else {
      result[step.id] = "pending";
    }
  }
  return result;
}

export interface MaverxChatState {
  messages: UIMessage[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  busy: boolean;
  isGenerating: boolean;
  intakeStatuses: Record<IntakeStepId, StepStatus>;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  stop: () => void;
}

export function useMaverxChat(): MaverxChatState {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/maverx-chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  const isGenerating = messages.some((m) =>
    m.parts.some(
      (p) =>
        p.type.startsWith("tool-") &&
        p.type.replace(/^tool-/, "") === "generateTraining" &&
        (p as ToolPart).state !== "output-available" &&
        (p as ToolPart).state !== "output-error",
    ),
  );

  const intakeStatuses = useMemo(
    () => detectIntakeProgress(messages as Parameters<typeof detectIntakeProgress>[0], isGenerating),
    [messages, isGenerating],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return {
    messages,
    input,
    setInput,
    bottomRef,
    busy,
    isGenerating,
    intakeStatuses,
    handleSubmit,
    handleKeyDown,
    stop,
  };
}
