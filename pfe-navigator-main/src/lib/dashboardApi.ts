import { apiFetch } from "./apiClient";
import type { DashboardSummaryData, DashboardSummaryResponse } from "./apiContracts";

export const getDashboardSummary = async (): Promise<DashboardSummaryData> => {
  const res = await apiFetch<DashboardSummaryResponse>("/api/dashboard/summary");
  return res.data;
};
