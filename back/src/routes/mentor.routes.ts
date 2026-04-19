import { Router } from "express";
import { mentorChat, mentorChatSchema } from "../controllers/mentor.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middleware/validateBody.js";

export const mentorRouter = Router();

mentorRouter.post(
  "/mentor/chat",
  validateBody(mentorChatSchema),
  asyncHandler(mentorChat)
);
