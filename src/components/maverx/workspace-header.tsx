"use client";

import { GraduationCap } from "lucide-react";
import Image from "next/image";

export function WorkspaceHeader() {
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
