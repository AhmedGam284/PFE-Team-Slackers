import type { RequestHandler } from "express";
import { z } from "zod";
import { MockDataService } from "../services/mockData.service.js";
import { OpenAIService } from "../services/openai.service.js";
import { FallbackService } from "../services/fallback.service.js";
import type { PfeProgressRequest } from "../types/dto/pfe.dto.js";
import { ok } from "../utils/responses.js";

export const pfeProgressSchema = z.object({
  projectTitle: z.string().min(1),
  completedTasks: z.array(z.string()).default([]),
  blockers: z.array(z.string()).default([]),
  nextGoals: z.array(z.string()).default([]),
  notes: z.string().optional().default(""),
});

const mockData = new MockDataService();
const openai = new OpenAIService();
const fallback = new FallbackService();

export const listProjects: RequestHandler = (_req, res) => {
  const data = mockData.getSuggestedProjects();
  return ok(res, data);
};

export const submitProgress: RequestHandler = async (req, res) => {
  const input = (req.validatedBody ?? req.body) as PfeProgressRequest;

  try {
    if (openai.isEnabled()) {
      const ai = await openai.generateProgressFeedback(input);
      return ok(res, ai);
    }
  } catch {
    // fall through
  }

  const data = fallback.progressFallback(input);
  return ok(res, data);
};
