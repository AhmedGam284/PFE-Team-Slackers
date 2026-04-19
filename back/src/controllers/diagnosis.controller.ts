import type { RequestHandler } from "express";
import { z } from "zod";
import { OpenAIService } from "../services/openai.service.js";
import { FallbackService } from "../services/fallback.service.js";
import type { DiagnosisAnalyzeRequest } from "../types/dto/diagnosis.dto.js";
import { ok } from "../utils/responses.js";

export const diagnosisAnalyzeSchema = z.object({
  studentName: z.string().min(1),
  academicLevel: z.string().min(1),
  specialization: z.string().min(1),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  careerGoals: z.array(z.string()).default([]),
  notes: z.string().optional().default(""),
});

const openai = new OpenAIService();
const fallback = new FallbackService();

export const analyzeDiagnosis: RequestHandler = async (req, res) => {
  const input = (req.validatedBody ?? req.body) as DiagnosisAnalyzeRequest;

  try {
    if (openai.isEnabled()) {
      const ai = await openai.analyzeDiagnosis(input);
      return ok(res, ai);
    }
  } catch {
    // fall through to fallback
  }

  const data = fallback.diagnosisFallback(input);
  return ok(res, data);
};
