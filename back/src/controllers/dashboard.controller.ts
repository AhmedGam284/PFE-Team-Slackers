import type { RequestHandler } from "express";
import { MockDataService } from "../services/mockData.service.js";
import { ok } from "../utils/responses.js";

const mockData = new MockDataService();

export const getDashboardSummary: RequestHandler = (_req, res) => {
  const data = mockData.getDashboardSummary();
  return ok(res, data);
};
