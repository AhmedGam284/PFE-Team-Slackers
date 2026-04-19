import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { diagnosisRouter } from "./diagnosis.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { pfeRouter } from "./pfe.routes.js";
import { mentorRouter } from "./mentor.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(diagnosisRouter);
apiRouter.use(dashboardRouter);
apiRouter.use(pfeRouter);
apiRouter.use(mentorRouter);
