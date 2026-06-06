"use client";

import { GraduationCap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { UIMessage } from "ai";

import type { ToolPart } from "~/components/maverx/types";
import { ToolPartView } from "~/components/maverx/tool-part-view";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

export interface ChatMessagesProps {
  messages: UIMessage[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({ messages, bottomRef }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 px-6 py-4">
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
            <GraduationCap className="text-primary h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-semibold">Ready to build your training</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Describe what you want to train. I&apos;ll ask a few questions, then
              generate a complete deck in Maverx house style.
            </p>
          </div>
          <div className="mt-2 rounded-xl border bg-muted/50 px-4 py-3 text-left text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Try: </span>
            &ldquo;A 3-hour Prompt Engineering training for the marketing team with
            no prior AI experience&rdquo;
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-4 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 460, damping: 32 }}
              className={cn(
                "flex flex-col gap-1.5",
                m.role === "user" ? "items-end" : "items-start",
              )}
            >
              {m.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm",
                      )}
                    >
                      {part.text}
                    </div>
                  );
                }
                if (part.type.startsWith("tool-")) {
                  return <ToolPartView key={i} part={part as ToolPart} />;
                }
                return null;
              })}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
