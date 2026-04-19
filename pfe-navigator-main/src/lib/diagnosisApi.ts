import { apiPostJson } from "./apiClient";
import type {
  DiagnosisAnalyzeData,
  DiagnosisAnalyzeRequest,
  DiagnosisAnalyzeResponse,
} from "./apiContracts";

export const analyzeDiagnosis = async (payload: DiagnosisAnalyzeRequest): Promise<DiagnosisAnalyzeData> => {
  const res = await apiPostJson<DiagnosisAnalyzeResponse, DiagnosisAnalyzeRequest>(
    "/api/diagnosis/analyze",
    payload,
  );

  return res.data;
};
