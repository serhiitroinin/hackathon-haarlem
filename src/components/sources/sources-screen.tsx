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

export function SourcesScreen() {
  const utils = api.useUtils();
  const sources = api.source.list.useQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const del = api.source.delete.useMutation({
    onSuccess: () => utils.source.list.invalidate(),
  });
  const clear = api.source.clear.useMutation({
    onSuccess: () => utils.source.list.invalidate(),
  });

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setUploading(true);
      try {
        const form = new FormData();
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
        await utils.source.list.invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [utils],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files?.length) void upload(e.dataTransfer.files);
    },
    [upload],
  );

  const items = sources.data ?? [];
  const totalChars = items.reduce((sum, s) => sum + s.chars, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ---- LEFT: upload + extracted sources ---------------------------- */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>1 · Add your source material</CardTitle>
            <CardDescription>
              Upload PDFs, text, or images. We extract the text and use it as
              context for the training you build next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
            >
              {uploading ? (
                <Loader2 className="text-muted-foreground h-7 w-7 animate-spin" />
              ) : (
                <Upload className="text-muted-foreground h-7 w-7" />
              )}
              <span className="text-sm font-medium">
                {uploading ? "Extracting…" : "Drop files or click to upload"}
              </span>
              <span className="text-muted-foreground text-xs">
                PDF · TXT · MD · CSV · PNG · JPG — up to 20 MB each
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
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Extracted sources ({items.length})</CardTitle>
              <CardDescription>
                {totalChars > 0
                  ? `${totalChars.toLocaleString()} characters of context ready`
                  : "Nothing yet — your uploads will appear here"}
              </CardDescription>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clear.mutate()}
                disabled={clear.isPending}
              >
                Clear all
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 && (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Upload a document to get started.
              </p>
            )}
            {items.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 rounded-lg border px-3 py-2"
              >
                <span className="text-muted-foreground mt-0.5">
                  <KindIcon kind={s.kind} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {s.kind.toUpperCase()} · {formatBytes(s.bytes)}
                    {s.kind === "image"
                      ? " · image (no text extracted)"
                      : ` · ${s.chars.toLocaleString()} chars`}
                  </p>
                  {s.preview && (
                    <p className="text-muted-foreground/80 mt-1 line-clamp-2 text-xs">
                      {s.preview}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => del.mutate({ id: s.id })}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ---- RIGHT: chat grounded in the uploaded docs ------------------- */}
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>2 · Explore &amp; plan</CardTitle>
            <CardDescription>
              Ask about your documents. Answers are grounded in what you uploaded.
            </CardDescription>
          </div>
          <Link href="/maverx">
            <Button size="sm" disabled={items.length === 0}>
              Build training <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex-1">
          <Chat
            api="/api/ingest-chat"
            placeholder={
              items.length
                ? "Ask about your documents…"
                : "Upload a document first, then ask about it…"
            }
            emptyState={
              <div className="text-muted-foreground py-8 text-center text-sm">
                {items.length === 0 ? (
                  <p>
                    Upload your source material on the left, then ask me to
                    summarize it or suggest a training to build from it.
                  </p>
                ) : (
                  <p>
                    {items.length} document{items.length > 1 ? "s" : ""} loaded. Try{" "}
                    <em>&ldquo;summarize the key concepts&rdquo;</em> or{" "}
                    <em>&ldquo;what training could I build from this?&rdquo;</em>
                  </p>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
