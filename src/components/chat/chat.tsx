"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Check, CircleAlert, Loader2, Square, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { renderToolOutput } from "~/components/chat/generative/registry";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

// Minimal shape of an AI SDK tool-invocation part (type is `tool-<name>`).
type ToolPart = {
  type: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  output?: unknown;
  errorText?: string;
};

/** Status chip shown while a tool runs or if it errors. */
function ToolChip({ part }: { part: ToolPart }) {
  const name = part.type.replace(/^tool-/, "");
  const failed = part.state === "output-error";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-muted-foreground bg-accent/40 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
    >
      {failed ? (
        <CircleAlert className="text-destructive h-3.5 w-3.5" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      <Wrench className="h-3 w-3" />
      <span className="text-foreground font-medium">{name}</span>
      <span>{failed ? "failed" : "running…"}</span>
    </motion.div>
  );
}

/** Renders a tool part: generative component when done, else a status chip. */
function ToolPartView({ part }: { part: ToolPart }) {
  if (part.state === "output-available") {
    const name = part.type.replace(/^tool-/, "");
    const ui = renderToolOutput(name, part.output);
    if (ui) return <>{ui}</>;
    // No dedicated renderer — show a "done" chip.
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-muted-foreground bg-accent/40 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
      >
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        <Wrench className="h-3 w-3" />
        <span className="text-foreground font-medium">{name}</span>
        <span>done</span>
      </motion.div>
    );
  }
  return <ToolChip part={part} />;
}

export function Chat({
  onResult,
  api = "/api/chat",
  placeholder = "Message the assistant…",
  emptyState,
  className,
  body,
}: {
  onResult?: () => void;
  /** Chat endpoint to talk to (defaults to the notes demo route). */
  api?: string;
  placeholder?: string;
  /** Replaces the default starter hint shown before the first message. */
  emptyState?: React.ReactNode;
  className?: string;
  /** Extra fields merged into every request body (e.g. `{ projectId }`). */
  body?: Record<string, unknown>;
}) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api, body }),
    // Fires when the assistant turn finishes — refresh anything tools touched.
    onFinish: () => onResult?.(),
  });

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setInput("");
  }

  return (
    <div className={cn("flex h-[28rem] flex-col", className)}>
      <ScrollArea className="flex-1 pr-3">
        <div className="flex flex-col gap-3 py-2">
          {messages.length === 0 &&
            (emptyState ?? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Try{" "}
                <em>
                  &ldquo;save a note pinned to the Grote Markt in Haarlem&rdquo;
                </em>{" "}
                then <em>&ldquo;give me a summary of my notes&rdquo;</em> — the agent
                calls tools and renders animated UI instead of text.
              </p>
            ))}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
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
                          "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
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
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        {busy ? (
          <Button type="button" size="icon" variant="secondary" onClick={stop}>
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
