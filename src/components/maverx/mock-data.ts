import type { GeneratedQuestion } from "~/components/maverx/follow-up-questions";
import type { IntakeFormData } from "~/components/maverx/types";

export function getDemoIntakeData(): IntakeFormData {
  return {
    topic: "Effective Feedback Conversations",
    audience: "Team leads and first-line managers",
    level: "intermediate",
    duration: "2 hours",
    objective:
      "Participants can apply the SBI model to give and receive feedback that is specific, actionable, and psychologically safe",
    files: [
      new File([""], "Feedback_Skills_Assessment.pdf", { type: "application/pdf" }),
      new File([""], "Team_Pulse_Survey_Q1.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    ],
  };
}

export const DEMO_QUESTIONS: GeneratedQuestion[] = [
  {
    id: "feedback_culture",
    question:
      "How would you describe the current feedback culture — is it mostly top-down, or do team members also give feedback to peers and managers?",
  },
  {
    id: "biggest_blocker",
    question:
      "What is the biggest reason managers avoid giving feedback — time pressure, fear of conflict, or uncertainty about how to frame it?",
  },
  {
    id: "tools_in_use",
    question:
      "Which performance review or 1-on-1 tools does your organisation currently use (e.g. Leapsome, Lattice, or plain calendar check-ins)?",
  },
  {
    id: "real_example",
    question:
      "Can you share a recent situation where a feedback conversation either went really well or didn't land as intended?",
  },
  {
    id: "success_metric",
    question:
      "How will you know, three months after this session, that something has actually changed in how feedback is given on your team?",
  },
];

export const DEMO_ANSWERS: Record<string, string> = {
  feedback_culture:
    "Mostly top-down. Managers review direct reports quarterly but peer feedback or upward feedback rarely happens naturally.",
  biggest_blocker:
    "Fear of conflict — managers worry feedback will damage the relationship or demotivate people, especially high performers.",
  tools_in_use:
    "We use Leapsome for annual reviews and bi-weekly 1-on-1s, but the 1-on-1 notes are rarely structured.",
  real_example:
    "A team lead gave vague praise after a product launch and the engineer felt invisible. The lead had specific things to say but never articulated them.",
  success_metric:
    "We'll run a 90-day pulse survey and track the 'I receive useful feedback' score in our next engagement survey.",
};
