import type { DiagnosisAnalyzeRequest } from "../types/dto/diagnosis.dto.js";
import type { PfeProgressRequest } from "../types/dto/pfe.dto.js";
import type { MentorChatRequest } from "../types/dto/mentor.dto.js";

type Prompt = {
  system: string;
  user: string;
};

const strictJsonRules = [
  "Return STRICT JSON only.",
  "Return a single JSON object and nothing else.",
  "No markdown. No code fences. No comments.",
  "Do not add extra keys beyond the schema.",
  "Keep outputs concise but useful.",
  "Do not claim certainty. Use cautious wording.",
  "Do not invent dangerous, unrealistic, or high-stakes claims.",
].join(" ");

export const buildDiagnosisPrompt = (input: DiagnosisAnalyzeRequest): Prompt => {
  const system =
    "You are PFE Compass AI, helping students choose and plan a PFE project. " +
    strictJsonRules +
    " Schema: { readinessScore: integer 0-100, strengths: string[], skillGaps: string[], recommendedPfeTracks: [{ title: string, reason: string, matchScore: integer 0-100 }], recommendedNextSteps: string[], mentorAdvice: string }. " +
    "Constraints: strengths<=10, skillGaps<=10, recommendedPfeTracks<=5, recommendedNextSteps<=10. " +
    "The advice must be professional, helpful, educational, and realistic for a student hackathon/MVP context.";

  const user =
    "Analyze the student profile and produce the JSON diagnosis object (schema above). " +
    "Base your answer only on the provided info; if something is missing, keep it generic and safe.\n\n" +
    `STUDENT_PROFILE_JSON: ${JSON.stringify(input)}`;

  return { system, user };
};

export const buildProgressPrompt = (input: PfeProgressRequest): Prompt => {
  const system =
    "You are PFE Compass AI acting as a practical PFE mentor. " +
    strictJsonRules +
    " Schema: { progressAssessment: string, riskLevel: 'low'|'medium'|'high', mentorFeedback: string, recommendedActions: string[] }. " +
    "Constraints: recommendedActions<=10. " +
    "Keep feedback actionable, scoped, and realistic.";

  const user =
    "Given the progress update, produce the JSON feedback object (schema above). " +
    "Do not assume facts not in the input; do not overpromise outcomes.\n\n" +
    `PROGRESS_UPDATE_JSON: ${JSON.stringify(input)}`;

  return { system, user };
};

export const buildMentorChatPrompt = (input: MentorChatRequest): Prompt => {
  const system =
    "You are PFE Compass AI acting as a helpful, practical mentor in a hackathon demo app. " +
    strictJsonRules +
    " Schema: { reply: string, quickReplies: string[] }. " +
    "Constraints: quickReplies<=3, each reply short (<=60 chars). " +
    "Keep the reply actionable, low-risk, and scoped to a student PFE context.";

  const user =
    "Answer the student's message with mentoring advice (schema above). " +
    "Use provided context if any, but do not assume missing facts.\n\n" +
    `MENTOR_CHAT_INPUT_JSON: ${JSON.stringify(input)}`;

  return { system, user };
};
