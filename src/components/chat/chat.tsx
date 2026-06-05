"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Check, CircleAlert, Loader2, Square, Wrench } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

// Minimal shape of an AI SDK tool-invocation part (type is `tool-<name>`).
type ToolPart = {
  type: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  errorText?: string;
};

function ToolCall({ part }: { part: ToolPart }) {
  const name = part.type.replace(/^tool-/, "");
  const done = part.state === "output-available";
  const failed = part.state === "output-error";
  return (
    <div className="text-muted-foreground flex items-center gap-2 rounded-lg border bg-accent/40 px-3 py-1.5 text-xs">
      {failed ? (
        <CircleAlert className="h-3.5 w-3.5 text-destructive" />
      ) : done ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      <Wrench className="h-3 w-3" />
      <span className="text-foreground font-medium">{name}</span>
      <span>{failed ? "failed" : done ? "done" : "running…"}</span>
    </div>
  );
}

export function Chat({ onResult }: { onResult?: () => void }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
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
    <div className="flex h-[28rem] flex-col">
      <ScrollArea className="flex-1 pr-3">
        <div className="flex flex-col gap-3 py-2">
          {messages.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Ask the assistant anything — or try{" "}
              <em>&ldquo;save a note pinned to the Grote Markt in Haarlem&rdquo;</em>{" "}
              to watch it call a tool and drop a pin on the map.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-1",
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
                  return <ToolCall key={i} part={part as ToolPart} />;
                }
                return null;
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the assistant…"
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
