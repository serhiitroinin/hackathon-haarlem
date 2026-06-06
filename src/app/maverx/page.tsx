import { ArrowLeft, GraduationCap, Presentation } from "lucide-react";
import Link from "next/link";

import { Chat } from "~/components/chat/chat";
import { ThemeToggle } from "~/components/theme-toggle";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const STEPS = [
  "Topic or skill to train",
  "Target audience",
  "Knowledge level",
  "Training length",
  "Primary learning objective",
];

export default function MaverxPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <header className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Maverx Training Builder
            </h1>
            <p className="text-muted-foreground text-sm">
              One sentence → a complete, editable training deck in house style.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Badge variant="secondary" className="cursor-pointer">
              <ArrowLeft className="mr-1 h-3 w-3" /> Sources
            </Badge>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Presentation className="h-4 w-4" /> What you&apos;ll get
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Editable .pptx (house style)</Badge>
          <Badge variant="secondary">Kick-off → theory → example → exercise → wrap-up</Badge>
          <Badge variant="secondary">Speaker notes on every slide</Badge>
          <Badge variant="secondary">Pre-bite + post-bite docs</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Chat
            api="/api/maverx-chat"
            placeholder="e.g. A 3-hour Prompt Engineering training for the marketing team…"
            emptyState={
              <div className="text-muted-foreground py-6 text-center text-sm">
                <p className="mb-3">
                  Tell me what you want to train. I&apos;ll ask a few questions, then
                  build the deck.
                </p>
                <ol className="mx-auto inline-flex flex-col gap-1 text-left text-xs">
                  {STEPS.map((s, i) => (
                    <li key={s}>
                      <span className="text-primary font-medium">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
              </div>
            }
          />
        </CardContent>
      </Card>
    </main>
  );
}
