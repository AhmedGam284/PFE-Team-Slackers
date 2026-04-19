// Frontend-friendly API contracts aligned with the backend DTOs in `back/src/types/dto/*`.

export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type ApiFailure = {
  success: false;
  error: ApiError;
};

// --- Health ---

export type HealthResponse = {
  success: true;
  message: string;
};

// --- Diagnosis ---

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

// --- Dashboard ---

export type DashboardSummaryData = {
  student: {
    name: string;
    specialization: string;
    readinessScore: number;
  };
  currentPfeRecommendation: {
    title: string;
    status: string;
  };
  progress: {
    completedMilestones: number;
    totalMilestones: number;
    completionPercentage: number;
  };
  alerts: string[];
  upcomingTasks: string[];
};

export type DashboardSummaryResponse = {
  success: true;
  data: DashboardSummaryData;
};

// --- PFE ---

export type PfeProjectDifficulty = "beginner" | "intermediate" | "advanced";

export type PfeProjectIdea = {
  id: string;
  title: string;
  domain: string;
  difficulty: PfeProjectDifficulty;
  description: string;
  requiredSkills: string[];
  matchReason: string;
};

export type PfeProjectsResponse = {
  success: true;
  data: PfeProjectIdea[];
};

export type PfeProgressRequest = {
  projectTitle: string;
  completedTasks: string[];
  blockers: string[];
  nextGoals: string[];
  notes?: string;
};

export type PfeProgressFeedbackData = {
  progressAssessment: string;
  riskLevel: "low" | "medium" | "high";
  mentorFeedback: string;
  recommendedActions: string[];
};

export type PfeProgressResponse = {
  success: true;
  data: PfeProgressFeedbackData;
};

// --- Mentor chat ---

export type MentorChatRequest = {
  message: string;
  studentName?: string;
  specialization?: string;
  readinessScore?: number;
  topTrack?: string;
  skillGaps?: string[];
};

export type MentorChatData = {
  reply: string;
  quickReplies: string[];
};

export type MentorChatResponse = {
  success: true;
  data: MentorChatData;
};
