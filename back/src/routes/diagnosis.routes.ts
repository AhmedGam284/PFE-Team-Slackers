import { Router } from "express";
import { analyzeDiagnosis, diagnosisAnalyzeSchema } from "../controllers/diagnosis.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middleware/validateBody.js";

export const diagnosisRouter = Router();

diagnosisRouter.post(
  "/diagnosis/analyze",
  validateBody(diagnosisAnalyzeSchema),
  asyncHandler(analyzeDiagnosis)
);
