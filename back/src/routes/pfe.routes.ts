import { Router } from "express";
import { listProjects, pfeProgressSchema, submitProgress } from "../controllers/pfe.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middleware/validateBody.js";

export const pfeRouter = Router();

pfeRouter.get("/pfe/projects", listProjects);

pfeRouter.post(
  "/pfe/progress",
  validateBody(pfeProgressSchema),
  asyncHandler(submitProgress)
);
