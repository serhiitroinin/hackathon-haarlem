"use client";

import { Check, GraduationCap, MessageSquare } from "lucide-react";
import Image from "next/image";

import { cn } from "~/lib/utils";

export interface WorkspaceHeaderProps {
  activeTab: "intake" | "chat";
  onTabChange: (tab: "intake" | "chat") => void;
  chatEnabled: boolean;
}

export function WorkspaceHeader({ activeTab, onTabChange, chatEnabled }: WorkspaceHeaderProps) {
  return (
    <header className="border-b bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/maverx-logo.png"
            alt="Maverx"
            width={100}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <div className="bg-border h-5 w-px" />
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary h-4 w-4" />
            <span className="text-sm font-semibold">Training Builder</span>
          </div>

          <div className="bg-border h-5 w-px" />

          {/* Tab navigation */}
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTabChange("intake")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "intake"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {chatEnabled ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <span className="text-primary/60 font-bold">1</span>
              )}
              Intake
            </button>

            <button
              type="button"
              onClick={() => chatEnabled && onTabChange("chat")}
              disabled={!chatEnabled}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "chat"
                  ? "bg-primary/10 text-primary"
                  : chatEnabled
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "cursor-not-allowed text-muted-foreground/40",
              )}
            >
              <MessageSquare className={cn("h-3 w-3", !chatEnabled && "opacity-40")} />
              Chat
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
            AI-Powered
          </span>
        </div>
      </div>
    </header>
  );
}
