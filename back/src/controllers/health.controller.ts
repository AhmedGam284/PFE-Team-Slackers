import type { RequestHandler } from "express";

export const healthCheck: RequestHandler = (_req, res) => {
  return res.json({
    success: true,
    message: "PFE Compass backend is running",
  });
};
