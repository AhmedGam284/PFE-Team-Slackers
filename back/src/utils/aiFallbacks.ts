import type { DiagnosisAnalyzeRequest } from "../types/dto/diagnosis.dto.js";
import type { PfeProgressRequest } from "../types/dto/pfe.dto.js";
import type { DiagnosisAnalyzeData } from "../types/dto/diagnosis.dto.js";
import type { PfeProgressFeedbackData } from "../types/dto/pfe.dto.js";
import { FallbackService } from "../services/fallback.service.js";

const fallback = new FallbackService();

export const diagnosisFallbackDefault = (input: DiagnosisAnalyzeRequest): DiagnosisAnalyzeData => {
  return fallback.diagnosisFallback(input);
};

export const progressFallbackDefault = (input: PfeProgressRequest): PfeProgressFeedbackData => {
  return fallback.progressFallback(input);
};
