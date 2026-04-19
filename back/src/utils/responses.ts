import type { Response } from "express";

export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: ApiError;
};

export const ok = <T>(res: Response, data: T, status = 200) => {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(status).json(body);
};

export const fail = (res: Response, error: ApiError, status = 500) => {
  const body: ApiFailure = { success: false, error };
  return res.status(status).json(body);
};
