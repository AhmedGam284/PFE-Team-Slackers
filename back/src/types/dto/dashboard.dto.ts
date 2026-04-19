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
