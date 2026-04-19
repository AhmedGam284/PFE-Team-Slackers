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
  private apiKey?: string;
  private model: string;

  constructor() {
    this.apiKey = env.GEMINI_API_KEY ?? env.OPENAI_API_KEY;
    this.model = env.GEMINI_MODEL ?? env.OPENAI_MODEL;
  }

  isEnabled() {
    return Boolean(this.apiKey);
  }

  private async askForJson<T>(params: {
    system: string;
    user: string;
    outputSchema: z.ZodSchema<T>;
    fallback: () => T;
  }): Promise<T> {
    if (!this.apiKey) {
      throw new Error("Gemini is not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: params.system }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: params.user }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      return params.fallback();
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
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
