import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof Error && err.message.startsWith("CORS blocked for origin:")) {
    return res.status(403).json({
      success: false,
      error: {
        message: err.message,
        code: "CORS_FORBIDDEN",
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: "HTTP_ERROR",
        details: err.details,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
};
