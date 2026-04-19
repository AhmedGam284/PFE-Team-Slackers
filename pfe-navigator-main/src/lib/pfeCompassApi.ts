import { apiFetch, apiPostJson } from "./apiClient";
import type {
  DiagnosisAnalyzeData,
  DiagnosisAnalyzeRequest,
  DiagnosisAnalyzeResponse,
  DashboardSummaryData,
  DashboardSummaryResponse,
  PfeProjectIdea,
  PfeProjectsResponse,
  PfeProgressFeedbackData,
  PfeProgressRequest,
  PfeProgressResponse,
} from "./apiContracts";

export const analyzeDiagnosis = async (payload: DiagnosisAnalyzeRequest): Promise<DiagnosisAnalyzeData> => {
  const res = await apiPostJson<DiagnosisAnalyzeResponse, DiagnosisAnalyzeRequest>(
    "/api/diagnosis/analyze",
    payload,
  );
  return res.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummaryData> => {
  const res = await apiFetch<DashboardSummaryResponse>("/api/dashboard/summary");
  return res.data;
};

export const getPfeProjects = async (): Promise<PfeProjectIdea[]> => {
  const res = await apiFetch<PfeProjectsResponse>("/api/pfe/projects");
  return res.data;
};

export const submitPfeProgress = async (payload: PfeProgressRequest): Promise<PfeProgressFeedbackData> => {
  const res = await apiPostJson<PfeProgressResponse, PfeProgressRequest>(
    "/api/pfe/progress",
    payload,
  );
  return res.data;
};
