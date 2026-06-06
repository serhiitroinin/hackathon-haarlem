"use client";

import { Check, ChevronDown, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

export interface WorkspaceHeaderProps {
  step: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: "Set up your training" },
  { number: 2, label: "Refine" },
  { number: 3, label: "Your Slides" },
] as const;

const MOCK_USER = { name: "Behnam Sepehri", email: "behnam.sep@gmail.com" };

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WorkspaceHeader({ step }: WorkspaceHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [language, setLanguage] = useState<"en" | "nl">("en");
  const isDark = resolvedTheme === "dark";

  return (
    <div className="border-b bg-card">
      <div className="flex h-14 items-center px-3 sm:px-6">
        {/* Left: company logo */}
        <div className="flex flex-1 items-center">
          <Image
            src={isDark ? "/maverx-logo.png" : "/maverx-logo-black.png"}
            alt="Maverx"
            width={200}
            height={100}
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Center: steps */}
        <div className="flex items-center gap-1 sm:gap-2">
          {STEPS.map((s, i) => {
            const done = step > s.number;
            const active = step === s.number;
            return (
              <div key={s.number} className="flex items-center gap-1 sm:gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium sm:px-3",
                    active
                      ? "bg-primary/10 text-primary"
                      : done
                        ? "text-emerald-600"
                        : "text-muted-foreground/50",
                  )}
                >
                  {done ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                        active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20",
                      )}
                    >
                      {s.number}
                    </span>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>

                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-4 rounded-full transition-colors sm:w-8",
                      step > s.number ? "bg-emerald-400" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: user profile */}
        <div className="flex flex-1 items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(MOCK_USER.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials(MOCK_USER.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{MOCK_USER.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{MOCK_USER.email}</span>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Language */}
              <div className="px-3 py-2.5">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                  Language
                </p>
                <div className="flex gap-1.5">
                  {(["en", "nl"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        language === lang
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {lang === "en" ? "English" : "Dutch"}
                    </button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Dark / Light mode */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <Moon className="text-muted-foreground h-3.5 w-3.5" />
                  ) : (
                    <Sun className="text-muted-foreground h-3.5 w-3.5" />
                  )}
                  <span className="text-sm">{isDark ? "Dark mode" : "Light mode"}</span>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
