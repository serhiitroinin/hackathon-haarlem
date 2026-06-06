"use client";

import { useMaverxChat } from "~/components/maverx/use-maverx-chat";
import { WorkspaceHeader } from "~/components/maverx/workspace-header";
import { WorkspaceSidebar } from "~/components/maverx/workspace-sidebar";
import { ChatMessages } from "~/components/maverx/chat-messages";
import { ChatInput } from "~/components/maverx/chat-input";

export function MaverxWorkspace() {
  const {
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
  } = useMaverxChat();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkspaceHeader />

      <div className="flex min-h-0 flex-1">
        <WorkspaceSidebar statuses={intakeStatuses} isGenerating={isGenerating} />

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
      </div>
    </div>
  );
}
