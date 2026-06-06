"use client";

import { ArrowLeft, ArrowRight, FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { GoogleDriveButton, GoogleG } from "~/components/google/google-drive-picker";
import { type DriveFileContent } from "~/lib/google/fake-drive";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Two-step project creation wizard:
 *   1. Title + initial context (free text)
 *   2. Attach starting documents/images (optional)
 * On finish it creates the Project, uploads any staged files to it, then routes
 * to the new project workspace.
 */
export function ProjectWizard({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  const utils = api.useUtils();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFileContent[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const create = api.project.create.useMutation();
  const driveImport = api.drive.importToProject.useMutation();

  function reset() {
    setStep(1);
    setTitle("");
    setContext("");
    setFiles([]);
    setDriveFiles([]);
    setBusy(false);
  }

  function addFiles(list: FileList | File[]) {
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  async function finish() {
    if (!title.trim()) {
      setStep(1);
      return toast.error("Give the project a title");
    }
    setBusy(true);
    try {
      const project = await create.mutateAsync({
        title: title.trim(),
        context: context.trim(),
      });
      if (files.length) {
        const form = new FormData();
        form.append("projectId", project.id);
        for (const f of files) form.append("files", f);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) toast.error("Some files failed to upload");
      }
      if (driveFiles.length) {
        await driveImport
          .mutateAsync({ projectId: project.id, fileIds: driveFiles.map((f) => f.id) })
          .catch(() => toast.error("Some Drive files failed to import"));
      }
      await utils.project.list.invalidate();
      toast.success(`Project “${project.title}” created`);
      setOpen(false);
      reset();
      router.push(`/projects/${project.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create project");
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className={cn("w-full justify-start gap-2", collapsed && "justify-center")}>
          <Plus className="h-4 w-4" />
          {!collapsed && "New project"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "New project" : "Add starting material"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "One organization case. Give it a title and any context you already have."
              : "Optionally attach documents or images. You can add more later."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-title">Title</Label>
              <Input
                id="project-title"
                placeholder="e.g. Gemeente Haarlem — youth care intake"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim()) setStep(2);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="project-context">Initial context</Label>
                {/* Inline use of file CONTENT: pull a doc's text straight into this field. */}
                <GoogleDriveButton
                  variant="ghost"
                  size="sm"
                  label="Insert from Drive"
                  className="h-7 px-2 text-[11px]"
                  onImport={(files) =>
                    setContext((c) =>
                      [c.trim(), ...files.map((f) => f.text)].filter(Boolean).join("\n\n"),
                    )
                  }
                />
              </div>
              <Textarea
                id="project-context"
                placeholder="Who is the organization, what's the case, what are we trying to achieve…"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={5}
              />
            </div>
          </div>
        ) : (
          <div className="py-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
            >
              <Upload className="text-muted-foreground h-6 w-6" />
              <span className="text-sm font-medium">Drop files or click to add</span>
              <span className="text-muted-foreground text-xs">
                PDF · TXT · MD · CSV · PNG · JPG
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.markdown,.csv,.json,.html,image/*,application/pdf,text/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
                  >
                    <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatBytes(f.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Google Drive */}
            <div className="mt-2 flex items-center gap-2">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-[10px] uppercase">or</span>
              <div className="bg-border h-px flex-1" />
            </div>
            <GoogleDriveButton
              full
              className="mt-2"
              onImport={(picked) =>
                setDriveFiles((prev) => {
                  const ids = new Set(prev.map((p) => p.id));
                  return [...prev, ...picked.filter((p) => !ids.has(p.id))];
                })
              }
            />
            {driveFiles.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {driveFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
                  >
                    <GoogleG size={14} />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="text-muted-foreground text-xs">Drive</span>
                    <button
                      type="button"
                      onClick={() => setDriveFiles((p) => p.filter((d) => d.id !== f.id))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {step === 1 ? (
            <>
              <span />
              <Button onClick={() => setStep(2)} disabled={!title.trim()}>
                Next <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)} disabled={busy}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <Button onClick={finish} disabled={busy}>
                {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Create project
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
