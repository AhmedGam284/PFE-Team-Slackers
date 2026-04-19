import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validateBody = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    next(parsed.error);
    return;
  }

  req.validatedBody = parsed.data;
  next();
};
