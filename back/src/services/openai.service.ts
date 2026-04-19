import OpenAI from "openai";
import { z } from "zod";
import { env } from "../utils/env.js";
import { buildDiagnosisPrompt, buildMentorChatPrompt, buildProgressPrompt } from "./promptBuilders.js";
import { parseAndValidateOrFallback } from "../utils/aiJson.js";
import { diagnosisFallbackDefault, progressFallbackDefault } from "../utils/aiFallbacks.js";
import type { DiagnosisAnalyzeRequest, DiagnosisAnalyzeData } from "../types/dto/diagnosis.dto.js";
import type { PfeProgressRequest, PfeProgressFeedbackData } from "../types/dto/pfe.dto.js";
import type { MentorChatData, MentorChatRequest } from "../types/dto/mentor.dto.js";

const diagnosisOutputSchema = z.object({
  readinessScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).max(10),
  skillGaps: z.array(z.string()).max(10),
  recommendedPfeTracks: z
    .array(
      z.object({
        title: z.string(),
        reason: z.string(),
        matchScore: z.number().int().min(0).max(100),
      })
    )
    .max(5),
  recommendedNextSteps: z.array(z.string()).max(10),
  mentorAdvice: z.string(),
});

const progressOutputSchema = z.object({
  progressAssessment: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  mentorFeedback: z.string(),
  recommendedActions: z.array(z.string()).max(10),
});

const mentorChatOutputSchema = z.object({
  reply: z.string(),
  quickReplies: z.array(z.string()).max(3),
});

export class OpenAIService {
  private client?: OpenAI;

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  isEnabled() {
    return Boolean(this.client);
  }

  private async askForJson<T>(params: {
    system: string;
    user: string;
    outputSchema: z.ZodSchema<T>;
    fallback: () => T;
  }): Promise<T> {
    if (!this.client) {
      throw new Error("OpenAI is not configured");
    }

    const completion = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return params.fallback();
    }

    const parsed = parseAndValidateOrFallback({
      rawText: content,
      schema: params.outputSchema,
      fallback: params.fallback,
    });

    if (!parsed.ok) {
      return params.fallback();
    }

    return parsed.value;
  }

  async analyzeDiagnosis(input: DiagnosisAnalyzeRequest): Promise<DiagnosisAnalyzeData> {
    const { system, user } = buildDiagnosisPrompt(input);
    return this.askForJson({
      system,
      user,
      outputSchema: diagnosisOutputSchema,
      fallback: () => diagnosisFallbackDefault(input),
    });
  }

  async generateProgressFeedback(input: PfeProgressRequest): Promise<PfeProgressFeedbackData> {
    const { system, user } = buildProgressPrompt(input);
    return this.askForJson({
      system,
      user,
      outputSchema: progressOutputSchema,
      fallback: () => progressFallbackDefault(input),
    });
  }

  async mentorChat(input: MentorChatRequest): Promise<MentorChatData> {
    const { system, user } = buildMentorChatPrompt(input);
    return this.askForJson({
      system,
      user,
      outputSchema: mentorChatOutputSchema,
      fallback: () => ({
        reply: "I couldn't generate a response right now. Please try again.",
        quickReplies: ["Suggest PFE topics", "Plan my next week", "Review my scope"],
      }),
    });
  }
}
