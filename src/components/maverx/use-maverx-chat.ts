"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useRef, useEffect, useState } from "react";

import type { IntakeFormData } from "~/components/maverx/types";

export interface MaverxChatState {
  messages: UIMessage[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  busy: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  stop: () => void;
}

export function useMaverxChat(intakeData: IntakeFormData): MaverxChatState {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSentInitialRef = useRef(false);
  const intakeDataRef = useRef(intakeData);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/maverx-chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  // Auto-send initial context message once on mount
  useEffect(() => {
    if (hasSentInitialRef.current) return;
    hasSentInitialRef.current = true;

    const { topic, audience, level, duration, objective, files } = intakeDataRef.current;
    const fileContext =
      files.length > 0 ? `\nReference documents: ${files.map((f) => f.name).join(", ")}` : "";

    const lines = [
      `- Topic: ${topic}`,
      `- Audience: ${audience}`,
      `- Knowledge level: ${level}`,
      ...(duration ? [`- Duration: ${duration}`] : []),
      ...(objective ? [`- Learning objective: ${objective}`] : []),
    ];
    const text =
      `Please create a training with the following details:\n` +
      lines.join("\n") +
      fileContext;

    void sendMessage({ text });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom on new messages
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
    handleSubmit,
    handleKeyDown,
    stop,
  };
}
