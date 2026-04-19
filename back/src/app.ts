import express from "express";
import cors from "cors";

import { env } from "./utils/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server / curl (no Origin header)
        if (!origin) return callback(null, true);

        // Hackathon/dev convenience: allow any origin in development.
        // Keeps the strict allowlist for production deployments.
        if (env.NODE_ENV !== "production") return callback(null, true);

        if (env.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: false,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
