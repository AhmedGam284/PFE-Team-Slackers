import type { RequestHandler } from "express";
import { z } from "zod";
import { OpenAIService } from "../services/openai.service.js";
import { FallbackService } from "../services/fallback.service.js";
import type { MentorChatRequest } from "../types/dto/mentor.dto.js";
import { ok } from "../utils/responses.js";

export const mentorChatSchema = z.object({
  message: z.string().min(1),
  studentName: z.string().optional(),
  specialization: z.string().optional(),
  readinessScore: z.number().int().min(0).max(100).optional(),
  topTrack: z.string().optional(),
  skillGaps: z.array(z.string()).optional().default([]),
});

const openai = new OpenAIService();
const fallback = new FallbackService();

export const mentorChat: RequestHandler = async (req, res) => {
  const input = (req.validatedBody ?? req.body) as MentorChatRequest;

  try {
    if (openai.isEnabled()) {
      const ai = await openai.mentorChat(input);
      return ok(res, ai);
    }
  } catch {
    // fall through to fallback
  }

  const data = fallback.mentorChatFallback(input);
  return ok(res, data);
};
