"use client";

import { GraduationCap, Paperclip, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

import type { IntakeFormData, IntakeStepId } from "~/components/maverx/types";
import { INTAKE_STEPS } from "~/components/maverx/constants";
import { GoogleDrivePicker, GoogleG } from "~/components/google/google-drive-picker";
import type { DriveFileMeta } from "~/lib/google/fake-drive";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

export interface IntakeFormProps {
  onComplete: (data: IntakeFormData) => void;
}

type FieldValues = Record<IntakeStepId, string>;

const INITIAL_FIELDS: FieldValues = {
  topic: "",
  audience: "",
  level: "",
  duration: "",
  objective: "",
};

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const REQUIRED_FIELDS: IntakeStepId[] = ["topic", "audience", "level"];

export function IntakeForm({ onComplete }: IntakeFormProps) {
  const [fields, setFields] = useState<FieldValues>(INITIAL_FIELDS);
  const [files, setFiles] = useState<File[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFileMeta[]>([]);
  const [drivePicker, setDrivePicker] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = REQUIRED_FIELDS.every((id) => fields[id].trim().length > 0);

  function updateField(id: IntakeStepId, value: string) {
    setFields((prev) => ({ ...prev, [id]: value }));
  }

  function addFiles(incoming: File[]) {
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !existingNames.has(f.name))];
    });
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onComplete({
      topic: fields.topic,
      audience: fields.audience,
      level: fields.level,
      duration: fields.duration || undefined,
      objective: fields.objective || undefined,
      files,
      driveFiles: driveFiles.length ? driveFiles : undefined,
    });
  }

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <GraduationCap className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Set up your training</h1>
            <p className="text-muted-foreground text-sm">
              Fill in the details and I&apos;ll build your complete deck.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {INTAKE_STEPS.map((step) => {
            const Icon = step.icon;
            const value = fields[step.id];
            const isOptional = "optional" in step && step.optional;
            const isObjective = step.id === "objective";
            const isLevel = step.id === "level";

            return (
              <div key={step.id} className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Icon className="text-primary/70 h-3.5 w-3.5" />
                  {step.label}
                  {isOptional ? (
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  ) : (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </label>
                <p className="text-muted-foreground -mt-0.5 text-xs">{step.description}</p>

                {isLevel ? (
                  <Select value={value} onValueChange={(v) => updateField(step.id, v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select knowledge level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : isObjective ? (
                  <Textarea
                    value={value}
                    onChange={(e) => updateField(step.id, e.target.value)}
                    placeholder={`e.g. ${step.description}`}
                    className="min-h-[80px] resize-none text-sm"
                    rows={3}
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => updateField(step.id, e.target.value)}
                    placeholder={`e.g. ${step.description}`}
                    className="text-sm"
                  />
                )}
              </div>
            );
          })}

          {/* File upload */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium">
              <Paperclip className="text-primary/70 h-3.5 w-3.5" />
              Reference documents
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <p className="text-muted-foreground -mt-0.5 text-xs">
              Existing slides, outlines, or notes to inform the training.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30",
              )}
            >
              <Upload className="text-muted-foreground h-5 w-5" />
              <p className="text-muted-foreground text-xs">
                Drop files here or <span className="text-primary font-medium">browse</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {files.length > 0 && (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-1 pt-1"
              >
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Paperclip className="text-muted-foreground h-3 w-3 shrink-0" />
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.name);
                      }}
                      className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}

            <div className="mt-2 flex items-center gap-2">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-[10px] uppercase">or</span>
              <div className="bg-border h-px flex-1" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full justify-center gap-2"
              onClick={() => setDrivePicker(true)}
            >
              <GoogleG size={15} /> Add from Google Drive
            </Button>
            {driveFiles.length > 0 && (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-1 pt-1"
              >
                {driveFiles.map((f) => (
                  <li
                    key={f.id}
                    className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <GoogleG size={12} />
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDriveFiles((p) => p.filter((d) => d.id !== f.id))}
                      className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
            <GoogleDrivePicker
              open={drivePicker}
              onOpenChange={setDrivePicker}
              onConfirm={(picked) =>
                setDriveFiles((prev) => {
                  const ids = new Set(prev.map((p) => p.id));
                  return [...prev, ...picked.filter((p) => !ids.has(p.id))];
                })
              }
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 w-full"
            size="lg"
          >
            Next →
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
