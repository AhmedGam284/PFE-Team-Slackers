import { apiFetch, apiPostJson } from "./apiClient";
import type {
  PfeProjectIdea,
  PfeProjectsResponse,
  PfeProgressFeedbackData,
  PfeProgressRequest,
  PfeProgressResponse,
} from "./apiContracts";

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
