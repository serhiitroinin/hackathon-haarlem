"use client";

import type { IntakeFormData } from "~/components/maverx/types";
import { useMaverxChat } from "~/components/maverx/use-maverx-chat";
import { ChatMessages } from "~/components/maverx/chat-messages";
import { ChatInput } from "~/components/maverx/chat-input";

export interface ChatPanelProps {
  intakeData: IntakeFormData;
}

export function ChatPanel({ intakeData }: ChatPanelProps) {
  const { messages, input, setInput, bottomRef, busy, handleSubmit, handleKeyDown, stop } =
    useMaverxChat(intakeData);

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <ChatMessages messages={messages} bottomRef={bottomRef} />
      <ChatInput
        input={input}
        setInput={setInput}
        busy={busy}
        stop={stop}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
      />
    </main>
  );
}
