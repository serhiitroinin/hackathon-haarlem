"use client";

import {
  ArrowRight,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { Chat } from "~/components/chat/chat";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === "image") return <ImageIcon className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const utils = api.useUtils();
  const project = api.project.byId.useQuery({ id: projectId });
  const sources = api.source.list.useQuery({ projectId });
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const del = api.source.delete.useMutation({
    onSuccess: () => {
      void utils.source.list.invalidate({ projectId });
      void utils.project.list.invalidate();
    },
  });

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("projectId", projectId);
        for (const f of list) form.append("files", f);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);
        const data = (await res.json()) as {
          created: { id: string }[];
          errors: { name: string; error: string }[];
        };
        if (data.created.length) {
          toast.success(
            `Added ${data.created.length} document${data.created.length > 1 ? "s" : ""}`,
          );
        }
        for (const e of data.errors) toast.error(`${e.name}: ${e.error}`);
        await utils.source.list.invalidate({ projectId });
        await utils.project.list.invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [projectId, utils],
  );

  const items = sources.data ?? [];
  const totalChars = items.reduce((sum, s) => sum + s.chars, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Project header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight">
            {project.data?.title ?? "…"}
          </h1>
          <p className="text-muted-foreground text-xs">
            {items.length} source{items.length === 1 ? "" : "s"} ·{" "}
            {totalChars.toLocaleString()} chars of context
          </p>
        </div>
        <Link href="/maverx">
          <Button size="sm" disabled={items.length === 0 && !project.data?.context}>
            Build training <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </header>

      {/* Big chat (left) + context panel (right) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-3">
        <section className="flex min-h-0 flex-col lg:col-span-2">
          <Chat
            key={projectId}
            api="/api/ingest-chat"
            body={{ projectId }}
            className="h-full px-6 py-4"
            placeholder={
              items.length || project.data?.context
                ? "Ask about this project's material…"
                : "Add context or documents, then ask about them…"
            }
            emptyState={
              <div className="text-muted-foreground py-10 text-center text-sm">
                <p>
                  This is the project workspace. Everything you add on the right is
                  context for this conversation — ask me to summarize it, find gaps,
                  or suggest a training to build from it.
                </p>
              </div>
            }
          />
        </section>

        {/* Context / assets panel */}
        <aside className="flex min-h-0 flex-col border-l">
          <div
            className="p-4"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) void upload(e.dataTransfer.files);
            }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
            >
              {uploading ? (
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              ) : (
                <Upload className="text-muted-foreground h-6 w-6" />
              )}
              <span className="text-sm font-medium">
                {uploading ? "Extracting…" : "Add documents"}
              </span>
              <span className="text-muted-foreground text-xs">
                PDF · TXT · MD · CSV · images
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.markdown,.csv,.json,.html,image/*,application/pdf,text/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
            {project.data?.context && (
              <Card className="mb-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Project context</CardTitle>
                  <CardDescription className="line-clamp-4 whitespace-pre-wrap text-xs">
                    {project.data.context}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Sources ({items.length})
            </p>
            {items.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No documents yet.
              </p>
            )}
            <div className="space-y-2">
              {items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-2.5 rounded-lg border px-3 py-2"
                >
                  <span className="text-muted-foreground mt-0.5">
                    <KindIcon kind={s.kind} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {s.kind.toUpperCase()} · {formatBytes(s.bytes)}
                      {s.kind === "image"
                        ? " · image"
                        : ` · ${s.chars.toLocaleString()} chars`}
                    </p>
                  </div>
                  <button
                    onClick={() => del.mutate({ id: s.id })}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
