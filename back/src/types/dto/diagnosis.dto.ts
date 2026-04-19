export type DiagnosisAnalyzeRequest = {
  studentName: string;
  academicLevel: string;
  specialization: string;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  notes?: string;
};

export type PfeTrackRecommendation = {
  title: string;
  reason: string;
  matchScore: number;
};

export type DiagnosisAnalyzeData = {
  readinessScore: number;
  strengths: string[];
  skillGaps: string[];
  recommendedPfeTracks: PfeTrackRecommendation[];
  recommendedNextSteps: string[];
  mentorAdvice: string;
};

export type DiagnosisAnalyzeResponse = {
  success: true;
  data: DiagnosisAnalyzeData;
};
