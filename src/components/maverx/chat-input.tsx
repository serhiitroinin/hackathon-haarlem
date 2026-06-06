"use client";

import { ArrowUp, Square } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  busy: boolean;
  stop: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatInput({
  input,
  setInput,
  busy,
  stop,
  handleSubmit,
  handleKeyDown,
}: ChatInputProps) {
  return (
    <div className="border-t bg-card px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your training idea… (Enter to send, Shift+Enter for new line)"
            className="min-h-[52px] max-h-36 resize-none pr-12 py-3.5 text-sm"
            autoFocus
            rows={1}
          />
        </div>
        {busy ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={stop}
            className="h-[52px] w-[52px] shrink-0"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-[52px] w-[52px] shrink-0"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </form>
      <p className="text-muted-foreground mt-2 text-center text-xs">
        Powered by Claude · Maverx house style · Editable .pptx output
      </p>
    </div>
  );
}
