import type {
  DiagnosisAnalyzeData,
  DiagnosisAnalyzeRequest,
} from "../types/dto/diagnosis.dto.js";
import type {
  PfeProgressFeedbackData,
  PfeProgressRequest,
} from "../types/dto/pfe.dto.js";
import type { MentorChatData, MentorChatRequest } from "../types/dto/mentor.dto.js";

export class FallbackService {
  diagnosisFallback(input: DiagnosisAnalyzeRequest): DiagnosisAnalyzeData {
    const skillCount = input.skills?.length ?? 0;
    const interestCount = input.interests?.length ?? 0;

    const readinessScore = Math.max(
      35,
      Math.min(90, 40 + skillCount * 5 + interestCount * 2)
    );

    const strengths = [
      ...(input.skills?.slice(0, 3) ?? []),
      input.specialization,
    ].filter(Boolean);

    const skillGaps = [
      "Problem framing",
      "Research methodology",
      "Project planning",
    ];

    const recommendedPfeTracks = [
      {
        title: "Applied AI / Automation",
        reason: "Leverages your interests and can be validated quickly with demos.",
        matchScore: Math.min(95, readinessScore + 10),
      },
      {
        title: "Web Platform / SaaS",
        reason: "Great for end-to-end delivery (frontend, API, deployment).",
        matchScore: Math.max(50, readinessScore),
      },
    ];

    const recommendedNextSteps = [
      "Pick 2–3 project ideas and define success criteria",
      "Identify datasets/APIs you can access",
      "Draft a milestone plan for 6–8 weeks",
    ];

    const mentorAdvice =
      "Keep scope tight: choose a problem you can demo with real users/data, then iterate weekly.";

    return {
      readinessScore,
      strengths,
      skillGaps,
      recommendedPfeTracks,
      recommendedNextSteps,
      mentorAdvice,
    };
  }

  progressFallback(input: PfeProgressRequest): PfeProgressFeedbackData {
    const blockers = input.blockers?.length ?? 0;
    const completed = input.completedTasks?.length ?? 0;

    const riskLevel: "low" | "medium" | "high" =
      blockers >= 3 ? "high" : blockers >= 1 ? "medium" : "low";

    const progressAssessment =
      completed > 0
        ? `You completed ${completed} task(s) and you’re moving forward.`
        : "No completed tasks reported yet—try to ship a small increment this week.";

    const mentorFeedback =
      riskLevel === "high"
        ? "You have multiple blockers—prioritize unblocking work (clarify requirements, reduce scope, and ask for help early)."
        : riskLevel === "medium"
          ? "You’re progressing, but address blockers quickly to avoid slipping the timeline."
          : "Good momentum—keep delivering small, testable milestones.";

    const recommendedActions = [
      ...(blockers ? ["Turn each blocker into a concrete question and assign an owner"] : []),
      "Define the next milestone as a demoable feature",
      "Review your plan for the next 7 days",
    ];

    return {
      progressAssessment,
      riskLevel,
      mentorFeedback,
      recommendedActions,
    };
  }

  mentorChatFallback(input: MentorChatRequest): MentorChatData {
    const name = input.studentName?.trim() || "there";
    const track = input.topTrack?.trim();
    const gaps = (input.skillGaps ?? []).slice(0, 2).filter(Boolean);

    const contextBits = [
      track ? `Top track: ${track}.` : null,
      gaps.length ? `Focus areas: ${gaps.join(", ")}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const reply =
      `Hi ${name}! ` +
      (contextBits ? `${contextBits} ` : "") +
      "For a strong PFE demo: keep scope tight, define 1 measurable success metric, and ship one small feature this week. " +
      "Tell me what you’re building and what’s blocking you.";

    return {
      reply,
      quickReplies: ["Suggest PFE topics", "Plan my next week", "Review my scope"],
    };
  }
}
