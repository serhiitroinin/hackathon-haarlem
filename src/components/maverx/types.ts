export type ToolPart = {
  type: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  output?: unknown;
  errorText?: string;
};

export type IntakeStepId = "topic" | "audience" | "level" | "duration" | "objective";

export type StepStatus = "pending" | "discussed" | "confirmed";

export interface IntakeFormData {
  topic: string;
  audience: string;
  level: string;
  duration?: string;
  objective?: string;
  files: File[];
}
