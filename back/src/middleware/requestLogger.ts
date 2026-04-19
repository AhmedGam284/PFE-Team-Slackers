import morgan from "morgan";
import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = morgan(":method :url :status :res[content-length] - :response-time ms");
