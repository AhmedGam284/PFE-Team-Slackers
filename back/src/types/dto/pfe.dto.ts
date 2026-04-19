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
