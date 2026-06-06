"use client";

import { useState } from "react";

import type { IntakeFormData } from "~/components/maverx/types";
import { WorkspaceHeader } from "~/components/maverx/workspace-header";
import { IntakeForm } from "~/components/maverx/intake-form";
import { ChatPanel } from "~/components/maverx/chat-panel";

export function MaverxWorkspace() {
  const [activeTab, setActiveTab] = useState<"intake" | "chat">("intake");
  const [intakeData, setIntakeData] = useState<IntakeFormData | null>(null);

  function handleIntakeComplete(data: IntakeFormData) {
    setIntakeData(data);
    setActiveTab("chat");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <WorkspaceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        chatEnabled={intakeData !== null}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {activeTab === "intake" || intakeData === null ? (
          <IntakeForm onComplete={handleIntakeComplete} />
        ) : (
          <ChatPanel intakeData={intakeData} />
        )}
      </div>
    </div>
  );
}
